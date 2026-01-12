export type FieldSize = 'sm' | 'md' | 'lg';

export type FieldType =
  // Campos Básicos
  | 'text'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'textarea'
  | 'phone'
  | 'email'
  // Campos de Selección
  | 'radio'
  | 'multiselect'
  | 'select_with_filter'
  // Campos Avanzados
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
  // Campos Especializados
  | 'document'
  | 'image'
  | 'cuit_razon_social'
  | 'group'
  | 'relation'
  | 'info'
  | 'sum'
  // Componentes UI
  | 'ui:header'
  | 'ui:divider'
  | 'ui:banner'
  | 'ui:paginator';

export interface SelectOption {
  value: string;
  label: string;
}

export interface RelationTag {
  id: string;
  label: string;
  type: string;
}

export interface FormFieldBase {
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
}

export interface FormFieldAdvanced extends FormFieldBase {
  // Para select, dropdown, multiselect, radio
  options?: SelectOption[];
  
  // Para slider
  min?: number;
  max?: number;
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
  
  // Para file uploads
  accept?: string;
  maxSize?: number;
  
  // Para sum
  sumFields?: string[];
  
  // Para group
  groupFields?: FormFieldAdvanced[];
  maxItems?: number;
  
  // Para relation
  relationTypes?: string[];
  relations?: RelationTag[];
  itemsPerPage?: number;
  
  // Para ui:header
  headerImage?: string;
  headerTitle?: string;
  headerDescription?: string;
  
  // Para ui:banner
  bannerType?: 'info' | 'warning' | 'error' | 'success';
  bannerMessage?: string;
}

export type FormField = FormFieldAdvanced;

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}
