from django.test import TestCase
from django.contrib.auth.models import User
from flows.models import Flujo, InstanciaFlujo
from flows.runtime import FlowRuntime
from flows.serializers import FlujoSerializer


class ConditionRuntimeTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('test', 'test@test.com', 'pass')
    
    def test_condition_branch_selection_and_logic(self):
        """Test condition branch selection with AND/OR logic"""
        flow_data = {
            'name': 'Test Condition Flow',
            'steps_data': [
                {'id': 'start1', 'type': 'start', 'name': 'Start', 'nextStepId': 'form1'},
                {
                    'id': 'form1',
                    'type': 'form',
                    'name': 'User Form',
                    'nextStepId': 'cond1',
                    'config': {
                        'fields': [
                            {'name': 'age', 'type': 'number', 'label': 'Age'},
                            {'name': 'category', 'type': 'text', 'label': 'Category'}
                        ]
                    }
                },
                {
                    'id': 'cond1',
                    'type': 'condition',
                    'name': 'Age Check',
                    'config': {
                        'branches': [
                            {
                                'id': 'adult_branch',
                                'label': 'Adult',
                                'logic': 'AND',
                                'nextStepId': 'form_adult',
                                'rules': [
                                    {'source': 'form', 'field': 'age', 'operator': '>=', 'value': '18'},
                                    {'source': 'form', 'field': 'category', 'operator': 'equals', 'value': 'premium'}
                                ]
                            },
                            {
                                'id': 'senior_branch',
                                'label': 'Senior',
                                'logic': 'OR',
                                'nextStepId': 'form_senior',
                                'rules': [
                                    {'source': 'form', 'field': 'age', 'operator': '>=', 'value': '65'},
                                    {'source': 'form', 'field': 'category', 'operator': 'equals', 'value': 'senior'}
                                ]
                            }
                        ],
                        'fallbackNextStepId': 'form_minor'
                    }
                },
                {'id': 'form_adult', 'type': 'form', 'name': 'Adult Form'},
                {'id': 'form_senior', 'type': 'form', 'name': 'Senior Form'},
                {'id': 'form_minor', 'type': 'form', 'name': 'Minor Form'},
            ]
        }
        
        serializer = FlujoSerializer(data=flow_data, context={'request': type('obj', (object,), {'user': self.user})()})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        flow = serializer.save()
        
        # Create instance
        instance = InstanciaFlujo.objects.create(
            flow=flow,
            legajo_id='test-legajo',
            current_step=flow.flow_steps.get(step_type='form'),
            created_by=self.user
        )
        
        runtime = FlowRuntime(instance)
        
        # Test case 1: Adult branch (AND logic - both conditions must be true)
        form_result = runtime.process_interaction({
            'age': '25',
            'category': 'premium'
        }, self.user)
        
        self.assertTrue(form_result['success'])
        instance.refresh_from_db()
        self.assertEqual(instance.current_step.step_type, 'condition')
        
        # Process condition (should select adult branch)
        condition_result = runtime.process_interaction({}, self.user)
        self.assertTrue(condition_result['success'])
        
        instance.refresh_from_db()
        self.assertEqual(instance.current_step.name, 'Adult Form')
        
        # Test case 2: Senior branch (OR logic - one condition is enough)
        instance2 = InstanciaFlujo.objects.create(
            flow=flow,
            legajo_id='test-legajo-2',
            current_step=flow.flow_steps.get(step_type='form'),
            created_by=self.user
        )
        
        runtime2 = FlowRuntime(instance2)
        
        # Age < 65 but category = senior (OR should pass)
        runtime2.process_interaction({
            'age': '45',
            'category': 'senior'
        }, self.user)
        
        instance2.refresh_from_db()
        runtime2.process_interaction({}, self.user)
        
        instance2.refresh_from_db()
        self.assertEqual(instance2.current_step.name, 'Senior Form')
        
        # Test case 3: Fallback
        instance3 = InstanciaFlujo.objects.create(
            flow=flow,
            legajo_id='test-legajo-3',
            current_step=flow.flow_steps.get(step_type='form'),
            created_by=self.user
        )
        
        runtime3 = FlowRuntime(instance3)
        
        # Neither adult nor senior conditions met
        runtime3.process_interaction({
            'age': '16',
            'category': 'basic'
        }, self.user)
        
        instance3.refresh_from_db()
        runtime3.process_interaction({}, self.user)
        
        instance3.refresh_from_db()
        self.assertEqual(instance3.current_step.name, 'Minor Form')
    
    def test_condition_operators(self):
        """Test different condition operators"""
        flow_data = {
            'name': 'Operator Test Flow',
            'steps_data': [
                {'id': 'start1', 'type': 'start', 'name': 'Start', 'nextStepId': 'eval1'},
                {
                    'id': 'eval1',
                    'type': 'evaluation',
                    'name': 'Score Evaluation',
                    'nextStepId': 'cond1',
                    'config': {
                        'questions': [
                            {
                                'id': 'q1',
                                'text': 'Rate service',
                                'type': 'single_choice',
                                'weight': 1,
                                'options': [
                                    {'id': 'excellent', 'text': 'Excellent', 'score': 10},
                                    {'id': 'good', 'text': 'Good', 'score': 7},
                                    {'id': 'poor', 'text': 'Poor', 'score': 3}
                                ]
                            }
                        ]
                    }
                },
                {
                    'id': 'cond1',
                    'type': 'condition',
                    'name': 'Score Condition',
                    'config': {
                        'branches': [
                            {
                                'id': 'high_score',
                                'label': 'High Score',
                                'logic': 'AND',
                                'nextStepId': 'form_high',
                                'rules': [
                                    {'source': 'evaluation', 'field': 'total_score', 'operator': '>', 'value': '8'}
                                ]
                            },
                            {
                                'id': 'medium_score',
                                'label': 'Medium Score',
                                'logic': 'AND',
                                'nextStepId': 'form_medium',
                                'rules': [
                                    {'source': 'evaluation', 'field': 'total_score', 'operator': '>=', 'value': '5'},
                                    {'source': 'evaluation', 'field': 'total_score', 'operator': '<=', 'value': '8'}
                                ]
                            }
                        ],
                        'fallbackNextStepId': 'form_low'
                    }
                },
                {'id': 'form_high', 'type': 'form', 'name': 'High Score Form'},
                {'id': 'form_medium', 'type': 'form', 'name': 'Medium Score Form'},
                {'id': 'form_low', 'type': 'form', 'name': 'Low Score Form'},
            ]
        }
        
        serializer = FlujoSerializer(data=flow_data, context={'request': type('obj', (object,), {'user': self.user})()})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        flow = serializer.save()
        
        # Test high score (> 8)
        instance = InstanciaFlujo.objects.create(
            flow=flow,
            legajo_id='test-legajo',
            current_step=flow.flow_steps.get(step_type='evaluation'),
            created_by=self.user
        )
        
        runtime = FlowRuntime(instance)
        
        # Submit evaluation with high score
        runtime.process_interaction({'q1': 'excellent'}, self.user)
        instance.refresh_from_db()
        
        # Process condition
        runtime.process_interaction({}, self.user)
        instance.refresh_from_db()
        
        self.assertEqual(instance.current_step.name, 'High Score Form')
    
    def test_condition_validation_errors(self):
        """Test that invalid condition configs raise validation errors"""
        # Test missing branches
        invalid_flow = {
            'name': 'Invalid Flow',
            'steps_data': [
                {'id': 'start1', 'type': 'start', 'name': 'Start', 'nextStepId': 'cond1'},
                {
                    'id': 'cond1',
                    'type': 'condition',
                    'name': 'Invalid Condition',
                    'config': {}  # No branches
                }
            ]
        }
        
        serializer = FlujoSerializer(data=invalid_flow, context={'request': type('obj', (object,), {'user': self.user})()})
        self.assertFalse(serializer.is_valid())
        self.assertIn('must have at least one branch', str(serializer.errors))
        
        # Test invalid nextStepId reference
        invalid_flow2 = {
            'name': 'Invalid Flow 2',
            'steps_data': [
                {'id': 'start1', 'type': 'start', 'name': 'Start', 'nextStepId': 'cond1'},
                {
                    'id': 'cond1',
                    'type': 'condition',
                    'name': 'Invalid Condition',
                    'config': {
                        'branches': [
                            {
                                'id': 'branch1',
                                'label': 'Branch 1',
                                'nextStepId': 'nonexistent_step',  # Invalid reference
                                'rules': [
                                    {'source': 'form', 'field': 'test', 'operator': 'equals', 'value': 'test'}
                                ]
                            }
                        ]
                    }
                }
            ]
        }
        
        serializer2 = FlujoSerializer(data=invalid_flow2, context={'request': type('obj', (object,), {'user': self.user})()})
        self.assertFalse(serializer2.is_valid())
        self.assertIn('references non-existent step', str(serializer2.errors))