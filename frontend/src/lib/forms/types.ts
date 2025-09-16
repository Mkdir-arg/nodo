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

export interface PlantillaLayoutResponse {
  id: string;
  nombre: string;
  layout_json: FormLayout;
  layout_version: number;
  updated_at: string;
}