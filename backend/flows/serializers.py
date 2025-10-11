import copy
import uuid
from collections import defaultdict, deque

from django.db import transaction
from rest_framework import serializers

from .models import (
    Flujo,
    EjecucionFlujo,
    InstanciaFlujo,
    Step,
    Transition,
    InstanceLog,
)


class FlujoSerializer(serializers.ModelSerializer):
    steps = serializers.SerializerMethodField()
    steps_data = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Flujo
        fields = [
            'id',
            'name',
            'description',
            'steps',
            'steps_data',
            'created_at',
            'updated_at',
            'is_active',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_steps(self, obj):
        flow_steps = obj.flow_steps.all().order_by('order')
        if flow_steps.exists():
            result = []
            for step in flow_steps:
                position = None
                if isinstance(step.ui_metadata, dict):
                    position = step.ui_metadata.get('position')

                payload = {
                    'id': str(step.id),
                    'name': step.name,
                    'type': step.step_type,
                    'config': step.config or {},
                    'position': position,
                }
                
                # Handle transitions based on step type
                if step.step_type == 'condition':
                    # Start with config as source of truth
                    config_branches = payload['config'].get('branches', [])
                    fallback_id = payload['config'].get('fallbackNextStepId')
                    
                    # Update nextStepId from actual transitions
                    transitions = step.outgoing_transitions.all()
                    transition_map = {}
                    
                    for transition in transitions:
                        if transition.condition == '__fallback__':
                            fallback_id = str(transition.to_step_id)
                        else:
                            transition_map[transition.condition] = str(transition.to_step_id)
                    
                    # Update branches with actual transition targets
                    updated_branches = []
                    for branch in config_branches:
                        branch_copy = branch.copy()
                        branch_id = branch.get('id')
                        if branch_id in transition_map:
                            branch_copy['nextStepId'] = transition_map[branch_id]
                        updated_branches.append(branch_copy)
                    
                    payload['config']['branches'] = updated_branches
                    if fallback_id:
                        payload['config']['fallbackNextStepId'] = fallback_id
                        
                else:
                    # For regular steps, add nextStepId
                    transition = step.outgoing_transitions.filter().first()
                    if transition:
                        payload['nextStepId'] = str(transition.to_step_id)
                
                result.append(payload)

            return result

        return obj.steps_data if obj.steps_data else []

    def _validate_flow_structure(self, steps_data):
        """Validate flow structure for cycles, duplicates, and integrity"""
        if not steps_data:
            return
        
        # Check for duplicate step IDs
        step_ids = [step.get('id') for step in steps_data if step.get('id')]
        if len(step_ids) != len(set(step_ids)):
            raise serializers.ValidationError("Duplicate step IDs found")
        
        # Build adjacency list and validate conditions
        graph = defaultdict(list)
        all_step_ids = set(str(step.get('id', '')) for step in steps_data)
        
        for step in steps_data:
            step_id = str(step.get('id', ''))
            step_type = step.get('type')
            config = step.get('config', {})
            
            if step_type == 'condition':
                self._validate_condition_config(step_id, config, all_step_ids)
                
                # Add to graph
                branches = config.get('branches', [])
                for branch in branches:
                    next_id = branch.get('nextStepId')
                    if next_id and str(next_id) in all_step_ids:
                        graph[step_id].append(str(next_id))
                
                fallback_id = config.get('fallbackNextStepId')
                if fallback_id and str(fallback_id) in all_step_ids:
                    graph[step_id].append(str(fallback_id))
            else:
                # Regular step
                next_id = step.get('nextStepId')
                if next_id:
                    if str(next_id) not in all_step_ids:
                        raise serializers.ValidationError(f"Step {step_id} references non-existent step {next_id}")
                    graph[step_id].append(str(next_id))
        
        # Detect cycles using DFS
        self._detect_cycles(graph, all_step_ids)
    
    def _validate_condition_config(self, step_id, config, all_step_ids):
        """Validate condition configuration"""
        branches = config.get('branches', [])
        if not branches:
            raise serializers.ValidationError(f"Condition step {step_id} must have at least one branch")
        
        # Check for duplicate branch IDs
        branch_ids = [b.get('id') for b in branches if b.get('id')]
        if len(branch_ids) != len(set(branch_ids)):
            raise serializers.ValidationError(f"Condition step {step_id} has duplicate branch IDs")
        
        # Validate each branch
        for i, branch in enumerate(branches):
            branch_label = branch.get('label', f'Branch {i+1}')
            
            # Check nextStepId exists
            next_id = branch.get('nextStepId')
            if next_id and str(next_id) not in all_step_ids:
                raise serializers.ValidationError(f"Branch '{branch_label}' references non-existent step {next_id}")
            
            # Validate rules
            rules = branch.get('rules', [])
            for j, rule in enumerate(rules):
                self._validate_condition_rule(step_id, branch_label, j+1, rule)
        
        # Validate fallback
        fallback_id = config.get('fallbackNextStepId')
        if fallback_id and str(fallback_id) not in all_step_ids:
            raise serializers.ValidationError(f"Condition step {step_id} fallback references non-existent step {fallback_id}")
    
    def _validate_condition_rule(self, step_id, branch_label, rule_num, rule):
        """Validate individual condition rule"""
        if not rule.get('source'):
            raise serializers.ValidationError(f"Step {step_id}, branch '{branch_label}', rule {rule_num}: Missing source")
        
        if not rule.get('field'):
            raise serializers.ValidationError(f"Step {step_id}, branch '{branch_label}', rule {rule_num}: Missing field")
        
        operator = rule.get('operator')
        valid_operators = ['equals', 'not_equals', '>', '<', '>=', '<=', 'contains']
        if operator not in valid_operators:
            raise serializers.ValidationError(f"Step {step_id}, branch '{branch_label}', rule {rule_num}: Invalid operator '{operator}'")
        
        if rule.get('value') is None or rule.get('value') == '':
            raise serializers.ValidationError(f"Step {step_id}, branch '{branch_label}', rule {rule_num}: Missing value")
    
    def _detect_cycles(self, graph, all_step_ids):
        """Detect cycles in flow graph"""
        visited = set()
        rec_stack = set()
        
        def has_cycle(node):
            if node in rec_stack:
                return True
            if node in visited:
                return False
            
            visited.add(node)
            rec_stack.add(node)
            
            for neighbor in graph[node]:
                if has_cycle(neighbor):
                    return True
            
            rec_stack.remove(node)
            return False
        
        for step_id in all_step_ids:
            if step_id and step_id not in visited:
                if has_cycle(step_id):
                    raise serializers.ValidationError(f"Cycle detected in flow starting from step {step_id}")

    def _sync_flow_structure(self, flow: Flujo, steps_data):
        steps_data = steps_data or []
        
        # Validate structure before processing
        self._validate_flow_structure(steps_data)

        flow.flow_steps.all().delete()

        step_lookup = {}
        normalized_steps = []

        # First pass: create Step records
        for index, raw_step in enumerate(steps_data):
            raw_id = raw_step.get('id')
            step_uuid = None
            if raw_id:
                try:
                    step_uuid = uuid.UUID(str(raw_id))
                except (ValueError, TypeError):
                    step_uuid = None
            if step_uuid is None:
                step_uuid = uuid.uuid4()

            position = raw_step.get('position')
            ui_metadata = {}
            if isinstance(position, dict):
                ui_metadata['position'] = position

            step_instance = Step.objects.create(
                id=step_uuid,
                flow=flow,
                step_type=raw_step.get('type') or 'form',
                name=raw_step.get('name') or f'Paso {index + 1}',
                config={},
                ui_metadata=ui_metadata,
                order=index,
            )

            if raw_id is not None:
                step_lookup[str(raw_id)] = step_instance
            step_lookup[str(step_uuid)] = step_instance

        # Second pass: update configs and create transitions
        for raw_step in steps_data:
            original_id = str(raw_step.get('id'))
            step_instance = step_lookup.get(original_id)
            if not step_instance:
                continue

            step_type = step_instance.step_type
            raw_config = raw_step.get('config') or {}
            next_step = None
            normalized_config = {}
            if step_type == 'condition':
                normalized_branches = []
                for branch in raw_config.get('branches') or []:
                    branch_id = branch.get('id') or str(uuid.uuid4())
                    target_original = branch.get('nextStepId')
                    target_step = step_lookup.get(str(target_original))
                    normalized_branches.append({
                        'id': branch_id,
                        'label': branch.get('label'),
                        'logic': branch.get('logic') if branch.get('logic') in ('AND', 'OR') else 'AND',
                        'rules': branch.get('rules') or [],
                        'nextStepId': str(target_step.id) if target_step else None,
                    })

                    if target_step:
                        Transition.objects.create(
                            from_step=step_instance,
                            to_step=target_step,
                            label=branch.get('label') or f'Branch {branch_id}',
                            condition=branch_id,  # Store branch_id for runtime lookup
                        )

                fallback_original = raw_config.get('fallbackNextStepId')
                fallback_step = step_lookup.get(str(fallback_original)) if fallback_original else None
                if fallback_step:
                    Transition.objects.create(
                        from_step=step_instance,
                        to_step=fallback_step,
                        label='Fallback',
                        condition='__fallback__',  # Special marker for fallback transitions
                    )

                normalized_config = {
                    'branches': normalized_branches,
                    'fallbackNextStepId': str(fallback_step.id) if fallback_step else None,
                }

            else:
                next_original = raw_step.get('nextStepId')
                next_step = step_lookup.get(str(next_original)) if next_original else None
                if next_step:
                    Transition.objects.create(
                        from_step=step_instance,
                        to_step=next_step,
                        label='',
                    )
                normalized_config = copy.deepcopy(raw_config)
                normalized_config.pop('nextStepId', None)

            step_instance.config = normalized_config
            step_instance.save(update_fields=['config'])

            normalized_step_payload = {
                'id': str(step_instance.id),
                'name': step_instance.name,
                'type': step_instance.step_type,
                'config': normalized_config,
                'position': step_instance.ui_metadata.get('position') if isinstance(step_instance.ui_metadata, dict) else None,
            }
            if step_instance.step_type != 'condition' and next_step is not None:
                normalized_step_payload['nextStepId'] = str(next_step.id)

            normalized_steps.append(normalized_step_payload)

        return normalized_steps

    def create(self, validated_data):
        steps_data = validated_data.pop('steps_data', [])
        request = self.context.get('request')

        with transaction.atomic():
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                validated_data['created_by'] = request.user

            flow = super().create(validated_data)
            normalized_steps = self._sync_flow_structure(flow, steps_data)
            flow.steps_data = normalized_steps
            flow.save(update_fields=['steps_data'])

        return flow

    def update(self, instance, validated_data):
        steps_data = validated_data.pop('steps_data', None)

        with transaction.atomic():
            flow = super().update(instance, validated_data)
            if steps_data is not None:
                # Migrar flujos legacy si es necesario
                if not flow.flow_steps.exists() and steps_data:
                    self._migrate_legacy_flow(flow)
                
                normalized_steps = self._sync_flow_structure(flow, steps_data)
                flow.steps_data = normalized_steps
                flow.save(update_fields=['steps_data'])

        return flow
    
    def _migrate_legacy_flow(self, flow):
        """Migra flujos legacy que solo tienen steps_data"""
        if flow.steps_data and not flow.flow_steps.exists():
            # Aplicar estructura desde steps_data existente
            self._sync_flow_structure(flow, flow.steps_data)


class EjecucionFlujoSerializer(serializers.ModelSerializer):
    flow_name = serializers.CharField(source='flow.name', read_only=True)

    class Meta:
        model = EjecucionFlujo
        fields = [
            'id',
            'flow',
            'flow_name',
            'status',
            'started_at',
            'completed_at',
            'error_message',
            'execution_data',
            'created_by',
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'created_by']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = '__all__'


class TransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transition
        fields = '__all__'


class InstanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstanceLog
        fields = '__all__'


class InstanciaFlujoSerializer(serializers.ModelSerializer):
    current_step = StepSerializer(read_only=True)

    class Meta:
        model = InstanciaFlujo
        fields = '__all__'
        read_only_fields = ('created_by',)


class FlowStartSerializer(serializers.Serializer):
    legajo_id = serializers.UUIDField()
    plantilla_id = serializers.UUIDField()
    context = serializers.JSONField(required=False, default=dict)


class FlowCandidateSerializer(serializers.Serializer):
    legajo_ids = serializers.ListField(child=serializers.UUIDField())
    plantilla_id = serializers.UUIDField()
    context = serializers.JSONField(required=False, default=dict)


class FlowInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstanciaFlujo
        fields = ['id', 'flow', 'legajo_id', 'status', 'started_at']
