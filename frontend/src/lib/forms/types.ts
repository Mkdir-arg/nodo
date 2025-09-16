export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "dropdown"
  | "multiselect"
  | "select_with_filter"
  | "date"
  | "document"
  | "sum"
  | "phone"
  | "cuit_razon_social"
  | "info"
  | "group";

export type ConditionOperator =
  | "eq"
  | "ne"
  | "in"
  | "nin"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains";

export type FieldCondition = {
  key: string;
  op: ConditionOperator;
  value?: unknown;
};

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type GridPlacement = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

interface BaseFieldProps {
  id: string;
  type: FieldType;
  key: string;
  label?: string;
  description?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  defaultValue?: unknown;
  esSubsanable?: boolean;
  esEditableOperador?: boolean;
  seMuestraEnGrilla?: boolean;
  condicionesOcultar?: FieldCondition[];
  condicionesRequerir?: FieldCondition[];
  kind?: "field" | "ui";
  layout?: GridPlacement;
}

export interface TextFieldProps extends BaseFieldProps {
  type: "text" | "textarea";
  maxLength?: number;
  pattern?: string;
}

export interface NumberFieldProps extends BaseFieldProps {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

export interface DateFieldProps extends BaseFieldProps {
  type: "date";
  minDate?: string;
  maxDate?: string;
}

export interface SelectFieldProps extends BaseFieldProps {
  type: "select" | "dropdown" | "select_with_filter";
  options: SelectOption[];
  placeholder?: string;
}

export interface MultiSelectFieldProps extends BaseFieldProps {
  type: "multiselect";
  options: SelectOption[];
  placeholder?: string;
  maxSelections?: number;
}

export interface DocumentFieldProps extends BaseFieldProps {
  type: "document";
  accept?: string[];
  maxSizeMB?: number;
  isNewFileFlag?: boolean;
}

export interface SumFieldProps extends BaseFieldProps {
  type: "sum";
  decimals?: number;
  sources?: string[];
}

export interface PhoneFieldProps extends BaseFieldProps {
  type: "phone";
}

export interface CuitRazonSocialFieldProps extends BaseFieldProps {
  type: "cuit_razon_social";
}

export interface InfoFieldProps extends BaseFieldProps {
  type: "info";
  format?: "text" | "html";
  html?: string;
}

export interface GroupFieldProps extends BaseFieldProps {
  type: "group";
  children: FieldProps[];
  minItems?: number;
  maxItems?: number;
}

export type FieldProps =
  | TextFieldProps
  | NumberFieldProps
  | DateFieldProps
  | SelectFieldProps
  | MultiSelectFieldProps
  | DocumentFieldProps
  | SumFieldProps
  | PhoneFieldProps
  | CuitRazonSocialFieldProps
  | InfoFieldProps
  | GroupFieldProps;

export type ColumnSpan =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

export interface LayoutFieldNode {
  id: string;
  type: "field";
  fieldId?: string;
  fieldKey?: string;
  colSpan?: ColumnSpan;
}

export interface LayoutColumnNode {
  id: string;
  type: "column";
  span: ColumnSpan;
  children: LayoutChildNode[];
}

export interface LayoutRowNode {
  id: string;
  type: "row";
  columns: LayoutColumnNode[];
  gutter?: number;
}

export interface LayoutSectionNode {
  id: string;
  type: "section";
  title?: string;
  description?: string;
  children: LayoutRowNode[];
}

export interface LayoutTabNode {
  id: string;
  type: "tab";
  title?: string;
  children?: LayoutRowNode[];
}

export interface LayoutTabsNode {
  id: string;
  type: "tabs";
  title?: string;
  description?: string;
  tabs: Array<{ id: string; title?: string }>;
  tabsChildren?: Record<string, LayoutChildNode[]>;
}

export interface LayoutRepeaterNode {
  id: string;
  type: "repeater";
  title?: string;
  description?: string;
  fieldKey?: string;
  minItems?: number;
  maxItems?: number;
  children?: LayoutRowNode[];
}

export type LayoutChildNode =
  | LayoutRowNode
  | LayoutFieldNode
  | LayoutSectionNode
  | LayoutTabsNode
  | LayoutRepeaterNode;

export type LayoutNode =
  | LayoutSectionNode
  | LayoutRowNode
  | LayoutColumnNode
  | LayoutFieldNode
  | LayoutTabsNode
  | LayoutRepeaterNode;

// Nuevos tipos para el constructor visual
export type NodeKind = 'section' | 'field';

export interface BaseNode {
  id: string;
  kind: NodeKind;
  order: number;
  parentId?: string;
}

export interface SectionNode extends BaseNode {
  kind: 'section';
  title: string;
  columns: number;
}

export interface FieldNode extends BaseNode {
  kind: 'field';
  type: string;
  colSpan: number;
  props?: Record<string, unknown>;
}

export interface FormLayout {
  version: number;
  nodes: Array<SectionNode | FieldNode>;
}
