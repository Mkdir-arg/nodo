from django.test import TestCase
from django.contrib.auth.models import User
from flows.models import Flujo, Step, Transition
from flows.serializers import FlujoSerializer
from rest_framework.exceptions import ValidationError


class ConditionValidationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('test', 'test@test.com', 'pass')
    
    def test_cycle_detection(self):
        """Test that cycles are detected in flow structure"""
        steps_data = [
            {'id': 'step1', 'type': 'start', 'name': 'Start', 'nextStepId': 'step2'},
            {'id': 'step2', 'type': 'form', 'name': 'Form', 'nextStepId': 'step3'},
            {'id': 'step3', 'type': 'form', 'name': 'Form2', 'nextStepId': 'step2'},  # Cycle
        ]
        
        serializer = FlujoSerializer()
        with self.assertRaises(ValidationError) as cm:
            serializer._validate_flow_structure(steps_data)
        
        self.assertIn('Cycle detected', str(cm.exception))
    
    def test_duplicate_step_ids(self):
        """Test that duplicate step IDs are detected"""
        steps_data = [
            {'id': 'step1', 'type': 'start', 'name': 'Start'},
            {'id': 'step1', 'type': 'form', 'name': 'Duplicate'},  # Duplicate ID
        ]
        
        serializer = FlujoSerializer()
        with self.assertRaises(ValidationError) as cm:
            serializer._validate_flow_structure(steps_data)
        
        self.assertIn('Duplicate step IDs', str(cm.exception))
    
    def test_condition_without_branches(self):
        """Test that condition steps without branches are detected"""
        steps_data = [
            {'id': 'step1', 'type': 'start', 'name': 'Start'},
            {'id': 'step2', 'type': 'condition', 'name': 'Condition', 'config': {}},  # No branches
        ]
        
        serializer = FlujoSerializer()
        with self.assertRaises(ValidationError) as cm:
            serializer._validate_flow_structure(steps_data)
        
        self.assertIn('has no branches', str(cm.exception))
    
    def test_valid_condition_structure(self):
        """Test that valid condition structures pass validation"""
        steps_data = [
            {'id': 'step1', 'type': 'start', 'name': 'Start', 'nextStepId': 'step2'},
            {
                'id': 'step2', 
                'type': 'condition', 
                'name': 'Condition',
                'config': {
                    'branches': [
                        {
                            'id': 'branch1',
                            'label': 'High Score',
                            'nextStepId': 'step3',
                            'rules': [{'source': 'evaluation', 'field': 'total_score', 'operator': '>', 'value': 80}]
                        }
                    ],
                    'fallbackNextStepId': 'step4'
                }
            },
            {'id': 'step3', 'type': 'form', 'name': 'High Score Form'},
            {'id': 'step4', 'type': 'form', 'name': 'Default Form'},
        ]
        
        # Should not raise any exception
        serializer = FlujoSerializer()
        serializer._validate_flow_structure(steps_data)
    
    def test_flow_creation_with_conditions(self):
        """Test complete flow creation with condition steps"""
        flow_data = {
            'name': 'Test Condition Flow',
            'description': 'Test flow with conditions',
            'steps_data': [
                {'id': 'start1', 'type': 'start', 'name': 'Start', 'nextStepId': 'eval1'},
                {
                    'id': 'eval1',
                    'type': 'evaluation', 
                    'name': 'Evaluation',
                    'nextStepId': 'cond1',
                    'config': {
                        'questions': [
                            {
                                'id': 'q1',
                                'text': 'Rate your experience',
                                'type': 'single_choice',
                                'weight': 1,
                                'options': [
                                    {'id': 'good', 'text': 'Good', 'score': 5},
                                    {'id': 'bad', 'text': 'Bad', 'score': 1}
                                ]
                            }
                        ],
                        'scoring_ranges': [
                            {'min_score': 0, 'max_score': 3, 'category': 'Low'},
                            {'min_score': 4, 'max_score': 5, 'category': 'High'}
                        ]
                    }
                },
                {
                    'id': 'cond1',
                    'type': 'condition',
                    'name': 'Score Check',
                    'config': {
                        'branches': [
                            {
                                'id': 'high_branch',
                                'label': 'High Score',
                                'nextStepId': 'form_high',
                                'logic': 'AND',
                                'rules': [
                                    {
                                        'source': 'evaluation',
                                        'field': 'total_score',
                                        'operator': '>=',
                                        'value': 4
                                    }
                                ]
                            }
                        ],
                        'fallbackNextStepId': 'form_low'
                    }
                },
                {'id': 'form_high', 'type': 'form', 'name': 'High Score Form'},
                {'id': 'form_low', 'type': 'form', 'name': 'Low Score Form'},
            ]
        }
        
        serializer = FlujoSerializer(data=flow_data, context={'request': type('obj', (object,), {'user': self.user})()})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        flow = serializer.save()
        
        # Verify structure was created correctly
        self.assertEqual(flow.flow_steps.count(), 5)
        
        condition_step = flow.flow_steps.get(step_type='condition')
        self.assertEqual(condition_step.outgoing_transitions.count(), 2)  # 1 branch + 1 fallback
        
        # Verify transitions have correct conditions
        branch_transition = condition_step.outgoing_transitions.filter(condition='high_branch').first()
        self.assertIsNotNone(branch_transition)
        self.assertEqual(branch_transition.label, 'High Score')
        
        fallback_transition = condition_step.outgoing_transitions.filter(condition='__fallback__').first()
        self.assertIsNotNone(fallback_transition)
        self.assertEqual(fallback_transition.label, 'Fallback')