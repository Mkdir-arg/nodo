import type { Flow } from './types';

export const FLOW_TEMPLATES: Omit<Flow, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Bienvenida por Email',
    description: 'Envía un email de bienvenida y registra la acción',
    steps: [
      {
        id: 'step1',
        type: 'email',
        name: 'Enviar email de bienvenida',
        config: {
          to: 'usuario@ejemplo.com',
          subject: 'Bienvenido a nuestra plataforma',
          body: 'Gracias por registrarte. ¡Esperamos que disfrutes de nuestros servicios!'
        },
        position: { x: 100, y: 100 },
        nextStepId: 'step2'
      },
      {
        id: 'step2',
        type: 'http',
        name: 'Registrar evento',
        config: {
          url: 'https://api.ejemplo.com/events',
          method: 'POST',
          body: '{"event": "welcome_email_sent", "user_id": "123"}'
        },
        position: { x: 300, y: 100 }
      }
    ]
  },
  {
    name: 'Procesamiento con Validación',
    description: 'Valida datos y procesa según el resultado',
    steps: [
      {
        id: 'step1',
        type: 'http',
        name: 'Obtener datos',
        config: {
          url: 'https://api.ejemplo.com/data',
          method: 'GET'
        },
        position: { x: 100, y: 100 },
        nextStepId: 'step2'
      },
      {
        id: 'step2',
        type: 'condition',
        name: 'Validar datos',
        config: {
          condition: 'status == "valid"',
          trueStepId: 'step3',
          falseStepId: 'step4'
        },
        position: { x: 300, y: 100 }
      },
      {
        id: 'step3',
        type: 'database',
        name: 'Guardar datos válidos',
        config: {
          table: 'valid_data',
          operation: 'insert',
          data: { status: 'processed' }
        },
        position: { x: 500, y: 50 }
      },
      {
        id: 'step4',
        type: 'email',
        name: 'Notificar error',
        config: {
          to: 'admin@ejemplo.com',
          subject: 'Error en validación',
          body: 'Se encontraron datos inválidos en el procesamiento'
        },
        position: { x: 500, y: 150 }
      }
    ]
  }
];