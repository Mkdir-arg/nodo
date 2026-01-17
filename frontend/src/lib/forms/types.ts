export type NodeKind = 'section' | 'field';
export type ColumnSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type FieldType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'date' 
  | 'checkbox' 
  | 'file'
  | 'email'
  | 'textarea'
  | 'phone'
  | 'info'
  | 'sum'
  | 'document'
  | 'image'
  | 'cuit_razon_social'
  | 'ref:nombre'
  | 'ref:apellido'
  | 'ref:documento'
  | 'ref:documento_tipo'
  | 'ref:direccion'
  | 'ref:direccion_numero'
  | 'ref:direccion_provincia'
  | 'ref:direccion_municipio';

export interface BaseNode {
  id: string;
  kind: NodeKind;
  order: number;
  parentId?: string;
}

export interface GridPlacement {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutSectionNode {
  id: string;
  type: 'section';
  title: string;
  children: Array<LayoutRowNode | LayoutColumnNode | LayoutFieldNode>;
  field?: FieldProps;
}

export interface LayoutRowNode {
  id: string;
  type: 'row';
  columns: LayoutColumnNode[];
  field?: FieldProps;
}

export interface LayoutColumnNode {
  id: string;
  type: 'column';
  span: ColumnSpan;
  children: LayoutFieldNode[];
  layout?: GridPlacement;
  field?: FieldProps;
}

export interface LayoutFieldNode {
  id: string;
  type: 'field';
  fieldId: string;
  fieldKey: string;
  colSpan: ColumnSpan;
  layout?: GridPlacement;
  field?: FieldProps;
}

export interface SectionNode extends BaseNode {
  kind: 'section';
  title: string;
  columns: number;
  field?: FieldProps;
}

export interface FieldNode extends BaseNode {
  kind: 'field';
  type: string;
  colSpan: number;
  props?: Record<string, unknown>;
  field?: FieldProps;
}

export interface FormLayout {
  version: number;
  nodes: Array<SectionNode | FieldNode | LayoutSectionNode | LayoutRowNode | LayoutColumnNode | LayoutFieldNode>;
}

export interface PlantillaLayoutResponse {
  id: string;
  nombre: string;
  layout_json: FormLayout;
  layout_version: number;
  updated_at: string;
}

export type LayoutNode = SectionNode | FieldNode | LayoutSectionNode | LayoutRowNode | LayoutColumnNode | LayoutFieldNode;

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldProps {
  id?: string;
  name?: string;
  type?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  minDate?: string;
  maxDate?: string;
  accept?: string[];
  maxSizeMB?: number;
  defaultValue?: unknown;
  field?: FieldProps;
  [key: string]: unknown;
}