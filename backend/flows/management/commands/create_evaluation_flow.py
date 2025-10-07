from django.core.management.base import BaseCommand
from flows.models import Flujo, Step, Transition
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Crea un flujo de prueba con evaluación'

    def handle(self, *args, **options):
        # Obtener o crear usuario
        user, _ = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@example.com', 'is_staff': True, 'is_superuser': True}
        )
        
        # Crear flujo
        flow, created = Flujo.objects.get_or_create(
            name='Flujo de Evaluación de Satisfacción',
            defaults={
                'description': 'Flujo de prueba con evaluación interactiva',
                'created_by': user
            }
        )
        
        if not created:
            # Limpiar steps existentes
            flow.flow_steps.all().delete()
        
        # 1. Nodo Start
        start_step = Step.objects.create(
            flow=flow,
            step_type='start',
            name='Inicio',
            config={
                'title': 'Evaluación de Satisfacción del Cliente',
                'description': 'Seleccione un legajo para comenzar la evaluación',
            },
            order=0
        )
        
        # 2. Nodo Evaluation
        evaluation_step = Step.objects.create(
            flow=flow,
            step_type='evaluation',
            name='Evaluación de Satisfacción',
            config={
                'title': 'Evaluación de Satisfacción del Cliente',
                'description': 'Evalúe la calidad del servicio brindado al cliente',
                'questions': [
                    {
                        'id': 'satisfaccion_general',
                        'text': '¿Cómo calificaría la satisfacción general del cliente?',
                        'type': 'single_choice',
                        'weight': 3,
                        'options': [
                            {'id': 'muy_satisfecho', 'text': 'Muy Satisfecho', 'score': 10},
                            {'id': 'satisfecho', 'text': 'Satisfecho', 'score': 8},
                            {'id': 'neutral', 'text': 'Neutral', 'score': 5},
                            {'id': 'insatisfecho', 'text': 'Insatisfecho', 'score': 3},
                            {'id': 'muy_insatisfecho', 'text': 'Muy Insatisfecho', 'score': 1}
                        ]
                    },
                    {
                        'id': 'tiempo_respuesta',
                        'text': '¿Cómo evalúa el tiempo de respuesta?',
                        'type': 'single_choice',
                        'weight': 2,
                        'options': [
                            {'id': 'excelente', 'text': 'Excelente (Inmediato)', 'score': 10},
                            {'id': 'bueno', 'text': 'Bueno (Menos de 1 hora)', 'score': 8},
                            {'id': 'regular', 'text': 'Regular (1-4 horas)', 'score': 5},
                            {'id': 'lento', 'text': 'Lento (Más de 4 horas)', 'score': 2}
                        ]
                    },
                    {
                        'id': 'aspectos_positivos',
                        'text': '¿Qué aspectos considera que fueron positivos? (Seleccione todos los que apliquen)',
                        'type': 'multiple_choice',
                        'weight': 1,
                        'options': [
                            {'id': 'atencion_personalizada', 'text': 'Atención personalizada', 'score': 3},
                            {'id': 'resolucion_rapida', 'text': 'Resolución rápida', 'score': 4},
                            {'id': 'comunicacion_clara', 'text': 'Comunicación clara', 'score': 3},
                            {'id': 'profesionalismo', 'text': 'Profesionalismo del equipo', 'score': 3}
                        ]
                    }
                ],
                'scoring_ranges': [
                    {
                        'min_score': 0,
                        'max_score': 25,
                        'category': 'Cliente Insatisfecho'
                    },
                    {
                        'min_score': 26,
                        'max_score': 50,
                        'category': 'Cliente Neutral'
                    },
                    {
                        'min_score': 51,
                        'max_score': 75,
                        'category': 'Cliente Satisfecho'
                    },
                    {
                        'min_score': 76,
                        'max_score': 100,
                        'category': 'Cliente Muy Satisfecho'
                    }
                ]
            },
            order=1
        )
        
        # Crear transición
        Transition.objects.create(
            from_step=start_step,
            to_step=evaluation_step,
            label='Continuar'
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Flujo creado exitosamente: {flow.name}')
        )
        self.stdout.write(f'   ID del flujo: {flow.id}')
        self.stdout.write(f'   Pasos creados: {flow.flow_steps.count()}')
        self.stdout.write(f'   URL de prueba: http://localhost:3008/flujos/runtime/flow-{flow.id}')