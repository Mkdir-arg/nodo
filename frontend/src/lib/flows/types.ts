export interface FlowStep {
  id: string;
  type: ActionType;
  name: string;
  config: ActionConfig;
  position?: { x: number; y: number };
  nextStepId?: string;
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  steps: FlowStep[];
  createdAt: string;
  updatedAt: string;
}

export type ActionType = 
  | 'start'
  | 'email'
  | 'http'
  | 'delay'
  | 'condition'
  | 'database'
  | 'transform';

export interface ActionConfig {
  [key: string]: any;
}

export interface EmailConfig extends ActionConfig {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

export interface HttpConfig extends ActionConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
}

export interface DelayConfig extends ActionConfig {
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours';
}

export interface ConditionConfig extends ActionConfig {
  condition: string;
  trueStepId?: string;
  falseStepId?: string;
}

export interface DatabaseConfig extends ActionConfig {
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: Record<string, any>;
  where?: Record<string, any>;
}

export interface TransformConfig extends ActionConfig {
  input: string;
  transformation: string;
  output: string;
}

export type SortDir = 'asc' | 'desc';

export interface TableCol {
  key: string;
  label: string;
}

export interface StartConfig extends ActionConfig {
  acceptedPlantillas: string[];
  tableColumns: TableCol[];
  defaultFilters: Record<string, unknown>;
  defaultSort: { key: string; dir: SortDir };
  pageSize: number;
}

export interface StartNodeData {
  kind: 'start';
  title: string;
  config: StartConfig;
}

export const ACTION_TYPES: { value: ActionType; label: string; description: string }[] = [
  { value: 'start', label: 'Inicio', description: 'Punto de inicio del flujo con tabla de candidatos' },
  { value: 'email', label: 'Enviar Email', description: 'Envía un correo electrónico' },
  { value: 'http', label: 'Petición HTTP', description: 'Realiza una petición HTTP' },
  { value: 'delay', label: 'Esperar', description: 'Pausa la ejecución por un tiempo' },
  { value: 'condition', label: 'Condición', description: 'Evalúa una condición y bifurca el flujo' },
  { value: 'database', label: 'Base de Datos', description: 'Operación en base de datos' },
  { value: 'transform', label: 'Transformar Datos', description: 'Transforma o procesa datos' },
];