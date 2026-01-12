export type FieldSize = 'sm' | 'md' | 'lg';

export type FieldType =
  // Datos de Referencia
  | 'text'
  | 'number'
  | 'select'
  // Campos Básicos
  | 'email'
  | 'textarea'
  | 'phone'
  | 'checkbox'
  | 'info'
  | 'sum'
  // Campos de Selección
  | 'radio'
  | 'dropdown'
  | 'multiselect'
  | 'select_with_filter'
  // Campos Avanzados
  | 'date'
  | 'document'
  | 'image'
  | 'cuit_razon_social'
  | 'group'
  // Nuevos Campos Avanzados
  | 'slider'
  | 'rating'
  | 'color'
  | 'time'
  | 'currency'
  | 'url'
  | 'password'
  | 'code'
  | 'tags'
  | 'switch'
  // Componentes Visuales
  | 'ui:header'
  | 'ui:divider'
  | 'ui:banner'
  | 'ui:paginator'
  | 'ui:relation'
  | 'calendar';

export interface SelectOption {
  value: string;
  label: string;
}

export interface RelationTag {
  id: string;
  label: string;
  type: string;
}

export interface GroupField {
  id: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  value?: any;
  size?: FieldSize;
  
  // Para select, dropdown, multiselect, radio
  options?: SelectOption[];
  
  // Para sum
  sumFields?: string[];
  
  // Para group
  groupFields?: FormField[];
  maxItems?: number;
  
  // Para ui:header
  headerImage?: string;
  headerTitle?: string;
  headerDescription?: string;
  
  // Para ui:banner
  bannerType?: 'info' | 'warning' | 'error' | 'success';
  bannerMessage?: string;
  
  // Para ui:relation
  relationTypes?: string[];
  relations?: RelationTag[];
  
  // Para validaciones
  min?: number;
  max?: number;
  pattern?: string;
  
  // Para file uploads
  accept?: string;
  maxSize?: number;
  
  // Para slider
  step?: number;
  showValue?: boolean;
  
  // Para rating
  maxRating?: number;
  
  // Para currency
  currency?: string;
  locale?: string;
  
  // Para url
  showPreview?: boolean;
  
  // Para password
  showStrength?: boolean;
  
  // Para code
  language?: string;
  showLineNumbers?: boolean;
  minRows?: number;
  maxRows?: number;
  
  // Para tags
  maxTags?: number;
  
  // Para switch
  description?: string;
  
  // Para calendar
  categories?: Category[];
  actions?: Action[];
  defaultView?: 'month' | 'week';
  locale?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  highlightToday?: boolean;
  allowMultipleActions?: boolean;
  showCategoryLegend?: boolean;
  maxActionsPerDay?: number;
  onDateSelect?: (date: Date) => void;
  onActionCreate?: (action: Action) => void;
  onActionUpdate?: (action: Action) => void;
  onActionDelete?: (actionId: string) => void;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Action {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  categoryId: string;
  time?: string;
  completed?: boolean;
  metadata?: Record<string, any>;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}