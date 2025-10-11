from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Flujo, InstanciaFlujo, Step, Transition
from .serializers import InstanciaFlujoSerializer, TransitionSerializer
from .runtime import create_instance_from_legajo
from legajos.models import Legajo


class FlowTransitionsView(APIView):
    """Endpoint to get all transitions for a flow"""
    permission_classes = []
    
    def get(self, request, flow_id):
        try:
            flow = get_object_or_404(Flujo, id=flow_id)
            
            # Get all steps and their transitions
            steps = flow.flow_steps.all().order_by('order')
            transitions_data = []
            
            for step in steps:
                transitions = step.outgoing_transitions.all()
                for transition in transitions:
                    transitions_data.append({
                        'id': str(transition.id),
                        'from_step_id': str(transition.from_step_id),
                        'to_step_id': str(transition.to_step_id),
                        'label': transition.label,
                        'condition': transition.condition,
                        'from_step_name': transition.from_step.name,
                        'to_step_name': transition.to_step.name,
                    })
            
            return Response({
                'flow_id': str(flow.id),
                'flow_name': flow.name,
                'transitions': transitions_data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class FlowSimulateView(APIView):
    """Simulate condition evaluation for testing"""
    permission_classes = []
    
    def post(self, request, flow_id):
        try:
            flow = get_object_or_404(Flujo, id=flow_id)
            context_data = request.data.get('context', {})
            step_id = request.data.get('step_id')
            
            if not step_id:
                return Response(
                    {'error': 'step_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            step = get_object_or_404(Step, id=step_id, flow=flow)
            
            if step.step_type != 'condition':
                return Response(
                    {'error': 'Step must be of type condition'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Simulate branch selection
            config = step.config or {}
            branches = config.get('branches', [])
            
            results = []
            selected_branch = None
            
            for branch in branches:
                # Simple rule evaluation for simulation
                rules_passed = len(branch.get('rules', [])) == 0  # Pass if no rules
                results.append({
                    'branch_id': branch.get('id'),
                    'branch_label': branch.get('label'),
                    'rules_passed': rules_passed,
                    'next_step_id': branch.get('nextStepId')
                })
                
                if rules_passed and not selected_branch:
                    selected_branch = branch
            
            fallback_id = config.get('fallbackNextStepId')
            fallback_used = not selected_branch and fallback_id
            
            return Response({
                'step_id': str(step.id),
                'step_name': step.name,
                'branch_results': results,
                'selected_branch': {
                    'branch_id': selected_branch.get('id') if selected_branch else None,
                    'branch_label': selected_branch.get('label') if selected_branch else None,
                    'next_step_id': selected_branch.get('nextStepId') if selected_branch else fallback_id
                } if selected_branch or fallback_used else None,
                'fallback_used': fallback_used
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class CreateInstanceView(APIView):
    permission_classes = []
    
    def post(self, request):
        flow_id = request.data.get('flow_id')
        legajo_id = request.data.get('legajo_id')
        
        if not flow_id or not legajo_id:
            return Response(
                {'error': 'flow_id y legajo_id son requeridos'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            flow = get_object_or_404(Flujo, id=flow_id)
            
            instance = create_instance_from_legajo(flow, legajo_id, request.user)
            
            serializer = InstanciaFlujoSerializer(instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )