from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.core.paginator import Paginator

from .models import Flujo, EjecucionFlujo, InstanciaFlujo, Step, InstanceLog
from .serializers import FlujoSerializer, EjecucionFlujoSerializer, InstanciaFlujoSerializer, StepSerializer, InstanceLogSerializer, FlowStartSerializer, FlowCandidateSerializer, FlowInstanceSerializer
from .compiler import TemplateCompiler
from .runtime import FlowRuntime, create_instance_from_legajo
from plantillas.models import Plantilla
from legajos.models import Legajo


class FlujoViewSet(viewsets.ModelViewSet):
    serializer_class = FlujoSerializer
    permission_classes = []
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']

    def get_queryset(self):
        return Flujo.objects.all()

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute a flow"""
        flow = self.get_object()
        
        # Create execution record
        execution = EjecucionFlujo.objects.create(
            flow=flow,
            created_by=request.user,
            status='pending'
        )
        
        # Execute the flow
        try:
            executor = FlowExecutor(execution)
            executor.execute()
            execution.completed_at = timezone.now()
            execution.save()
        except Exception as e:
            execution.status = 'failed'
            execution.error_message = str(e)
            execution.completed_at = timezone.now()
            execution.save()
        
        serializer = EjecucionFlujoSerializer(execution)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def executions(self, request, pk=None):
        """Get executions for a flow"""
        flow = self.get_object()
        executions = flow.executions.all()
        serializer = EjecucionFlujoSerializer(executions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='candidates')
    def get_candidates(self, request, pk=None):
        """Get candidate legajos for flow execution"""
        flow = self.get_object()
        start_config = flow.get_start_node_config()
        
        if not start_config:
            return Response({'error': 'No start node configuration found'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Mock legajos data - replace with actual Legajo model query
        mock_legajos = [
            {
                'id': f'legajo-{i}',
                'nombre': f'Legajo {i}',
                'plantilla_id': 'plantilla-1',
                'created_at': '2024-01-01T00:00:00Z',
                'estado': 'activo'
            }
            for i in range(1, 51)
        ]
        
        # Apply filters from start_config
        accepted_plantillas = start_config.get('acceptedPlantillas', [])
        if accepted_plantillas:
            mock_legajos = [l for l in mock_legajos if l['plantilla_id'] in accepted_plantillas]
        
        # Apply search filter
        search = request.query_params.get('search', '')
        if search:
            mock_legajos = [l for l in mock_legajos if search.lower() in l['nombre'].lower()]
        
        # Apply sorting
        sort_config = start_config.get('defaultSort', {'key': 'created_at', 'dir': 'desc'})
        reverse = sort_config.get('dir') == 'desc'
        mock_legajos.sort(key=lambda x: x.get(sort_config.get('key', 'id')), reverse=reverse)
        
        # Pagination
        page_size = start_config.get('pageSize', 25)
        page = int(request.query_params.get('page', 1))
        paginator = Paginator(mock_legajos, page_size)
        page_obj = paginator.get_page(page)
        
        return Response({
            'results': list(page_obj),
            'count': paginator.count,
            'page': page,
            'pages': paginator.num_pages,
            'page_size': page_size
        })
    
    @action(detail=True, methods=['post'], url_path='start')
    def start_flow(self, request, pk=None):
        """Start flow execution for single legajo"""
        flow = self.get_object()
        serializer = FlowStartSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        start_config = flow.get_start_node_config()
        
        # Validate plantilla is accepted
        accepted_plantillas = start_config.get('acceptedPlantillas', [])
        if accepted_plantillas and data['plantilla_id'] not in accepted_plantillas:
            return Response({'error': 'Plantilla not accepted for this flow'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create flow instance
        instance = InstanciaFlujo.objects.create(
            flow=flow,
            legajo_id=data['legajo_id'],
            plantilla_id=data['plantilla_id'],
            context_json=data.get('context', {}),
            created_by=request.user,
            status='pending'
        )
        
        # Execute flow asynchronously (in production, use Celery)
        try:
            execute_flow_instance(instance.id)
        except Exception as e:
            instance.status = 'failed'
            instance.error_message = str(e)
            instance.save()
        
        return Response(FlowInstanceSerializer(instance).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], url_path='start/bulk')
    def start_flow_bulk(self, request, pk=None):
        """Start flow execution for multiple legajos"""
        flow = self.get_object()
        serializer = FlowCandidateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        start_config = flow.get_start_node_config()
        
        # Validate plantilla is accepted
        accepted_plantillas = start_config.get('acceptedPlantillas', [])
        if accepted_plantillas and data['plantilla_id'] not in accepted_plantillas:
            return Response({'error': 'Plantilla not accepted for this flow'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Limit bulk operations
        if len(data['legajo_ids']) > 1000:
            return Response({'error': 'Maximum 1000 legajos per bulk operation'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create instances in transaction
        instances = []
        with transaction.atomic():
            for legajo_id in data['legajo_ids']:
                instance = InstanciaFlujo.objects.create(
                    flow=flow,
                    legajo_id=legajo_id,
                    plantilla_id=data['plantilla_id'],
                    context_json=data.get('context', {}),
                    created_by=request.user,
                    status='pending'
                )
                instances.append(instance)
        
        # Execute flows asynchronously (in production, use Celery)
        for instance in instances:
            try:
                execute_flow_instance(instance.id)
            except Exception as e:
                instance.status = 'failed'
                instance.error_message = str(e)
                instance.save()
        
        return Response({
            'created': len(instances),
            'instances': FlowInstanceSerializer(instances, many=True).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def compile_from_template(self, request):
        """Compila una plantilla en un flujo ejecutable"""
        plantilla_id = request.data.get('plantilla_id')
        flow_name = request.data.get('flow_name')
        
        if not plantilla_id:
            return Response(
                {'error': 'plantilla_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            plantilla = get_object_or_404(Plantilla, id=plantilla_id)
            compiler = TemplateCompiler(plantilla)
            flow = compiler.compile_to_flow(flow_name)
            
            serializer = self.get_serializer(flow)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def steps(self, request, pk=None):
        """Obtiene los pasos de un flujo"""
        flow = self.get_object()
        steps = flow.flow_steps.all()
        serializer = StepSerializer(steps, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='instances')
    def get_instances(self, request, pk=None):
        """Get flow instances (execution history)"""
        flow = self.get_object()
        instances = InstanciaFlujo.objects.filter(flow=flow, created_by=request.user)
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            instances = instances.filter(status=status_filter)
        
        serializer = InstanciaFlujoSerializer(instances, many=True)
        return Response(serializer.data)




class InstanciaFlujoViewSet(viewsets.ModelViewSet):
    queryset = InstanciaFlujo.objects.all()
    serializer_class = InstanciaFlujoSerializer
    permission_classes = []
    
    def get_permissions(self):
        return []
    
    def get_queryset(self):
        print(f"[DEBUG] get_queryset called")
        return InstanciaFlujo.objects.all()
    
    def list(self, request, *args, **kwargs):
        print(f"[DEBUG] LIST method called")
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        print(f"[DEBUG] CREATE method called with data: {request.data}")
        print(f"[DEBUG] User: {request.user}")
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"[DEBUG] Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Asignar usuario por defecto si no hay autenticación
        if hasattr(request, 'user') and request.user.is_authenticated:
            serializer.validated_data['created_by'] = request.user
        else:
            from django.contrib.auth.models import User
            default_user, _ = User.objects.get_or_create(username='default', defaults={'email': 'default@test.com'})
            serializer.validated_data['created_by'] = default_user
        
        # Obtener el primer paso del flujo
        flow = serializer.validated_data['flow']
        first_step = flow.flow_steps.filter(order=0).first()
        if first_step:
            serializer.validated_data['current_step'] = first_step
            print(f"[DEBUG] First step found: {first_step.name}")
        else:
            print(f"[DEBUG] No first step found for flow: {flow.name}")
        
        instance = serializer.save()
        print(f"[DEBUG] Instance created: {instance.id}")
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def dispatch(self, request, *args, **kwargs):
        print(f"[DEBUG] DISPATCH: {request.method} {request.path}")
        print(f"[DEBUG] Available methods: {self.allowed_methods}")
        return super().dispatch(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def create_from_legajo(self, request):
        """Crea una instancia desde un legajo"""
        flow_id = request.data.get('flow_id')
        legajo_id = request.data.get('legajo_id')
        
        if not flow_id or not legajo_id:
            return Response(
                {'error': 'flow_id y legajo_id son requeridos'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            flow = get_object_or_404(Flujo, id=flow_id)
            legajo = get_object_or_404(Legajo, id=legajo_id)
            
            instance = create_instance_from_legajo(flow, legajo_id, request.user)
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def current_step(self, request, pk=None):
        """Obtiene el HTML del paso actual"""
        instance = self.get_object()
        runtime = FlowRuntime(instance)
        
        try:
            html = runtime.get_current_step_html()
            transitions = runtime.get_available_transitions()
            
            return Response({
                'html': html,
                'transitions': transitions,
                'status': instance.status,
                'current_step_id': str(instance.current_step.id) if instance.current_step else None
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def interact(self, request, pk=None):
        """Procesa una interacción del usuario"""
        instance = self.get_object()
        runtime = FlowRuntime(instance)
        
        try:
            result = runtime.process_interaction(
                request.data, 
                request.user
            )
            
            # Si hay delay, programar reanudación
            if result.get('pause_until'):
                runtime.pause_for_delay(result['pause_until'])
            
            return Response(result)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        """Obtiene los logs de la instancia"""
        instance = self.get_object()
        logs = instance.logs.all()[:50]  # Últimos 50 logs
        serializer = InstanceLogSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def context(self, request, pk=None):
        """Obtiene el contexto actual de la instancia"""
        instance = self.get_object()
        return Response(instance.context)


class EjecucionFlujoViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EjecucionFlujoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'flow']

    def get_queryset(self):
        return EjecucionFlujo.objects.filter(created_by=self.request.user)


class StepViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Step.objects.all()
    serializer_class = StepSerializer
    permission_classes = [IsAuthenticated]


class InstanceLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InstanceLog.objects.all()
    serializer_class = InstanceLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return InstanceLog.objects.filter(
            instance__created_by=self.request.user
        )