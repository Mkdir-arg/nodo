export type NodeKind = 'section' | 'field';
export type ColumnSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

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
}

export interface LayoutRowNode {
  id: string;
  type: 'row';
  columns: LayoutColumnNode[];
}

export interface LayoutColumnNode {
  id: string;
  type: 'column';
  span: ColumnSpan;
  children: LayoutFieldNode[];
  layout?: GridPlacement;
}

export interface LayoutFieldNode {
  id: string;
  type: 'field';
  fieldId: string;
  fieldKey: string;
  colSpan: ColumnSpan;
  layout?: GridPlacement;
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
  nodes: Array<SectionNode | FieldNode | LayoutSectionNode | LayoutRowNode | LayoutColumnNode | LayoutFieldNode>;
}

export interface PlantillaLayoutResponse {
  id: string;
  nombre: string;
  layout_json: FormLayout;
  layout_version: number;
  updated_at: string;
}