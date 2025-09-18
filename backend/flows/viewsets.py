from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.core.paginator import Paginator

from .models import Flow, FlowExecution
from .serializers import FlowSerializer, FlowExecutionSerializer
from .flow_serializers import FlowInstanceSerializer, FlowStartSerializer, FlowCandidateSerializer
from .flow_runner import FlowInstance
from .executor import FlowExecutor
from .flow_engine import execute_flow_instance


class FlowViewSet(viewsets.ModelViewSet):
    serializer_class = FlowSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']

    def get_queryset(self):
        return Flow.objects.filter(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute a flow"""
        flow = self.get_object()
        
        # Create execution record
        execution = FlowExecution.objects.create(
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
        
        serializer = FlowExecutionSerializer(execution)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def executions(self, request, pk=None):
        """Get executions for a flow"""
        flow = self.get_object()
        executions = flow.executions.all()
        serializer = FlowExecutionSerializer(executions, many=True)
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
        instance = FlowInstance.objects.create(
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
                instance = FlowInstance.objects.create(
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
    
    @action(detail=True, methods=['get'], url_path='instances')
    def get_instances(self, request, pk=None):
        """Get flow instances (execution history)"""
        flow = self.get_object()
        instances = FlowInstance.objects.filter(flow=flow, created_by=request.user)
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            instances = instances.filter(status=status_filter)
        
        serializer = FlowInstanceSerializer(instances, many=True)
        return Response(serializer.data)




class FlowExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FlowExecutionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'flow']

    def get_queryset(self):
        return FlowExecution.objects.filter(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a flow execution"""
        execution = self.get_object()
        
        if execution.status in ['pending', 'running']:
            execution.status = 'cancelled'
            execution.save()
            
            serializer = self.get_serializer(execution)
            return Response(serializer.data)
        
        return Response(
            {'error': 'Cannot cancel execution in current status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )