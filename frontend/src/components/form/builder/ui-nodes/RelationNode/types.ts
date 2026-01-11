export interface RelationNodeConfig {
  relation_type: string;
  inverse_relation_type: string;
  target_plantilla_id: string;
  title: string;
  description?: string;
  allow_create: boolean;
  allow_remove: boolean;
  display_fields: string[];
  search_fields: string[];
}

export interface RelationNode {
  id: string;
  type: 'ui:relation';
  kind: 'ui';
  config: RelationNodeConfig;
}

export interface RelatedRecord {
  id: string;
  [key: string]: any;
}

export interface Relation {
  id: string;
  source_legajo: string;
  target_legajo: string;
  relation_type: string;
  inverse_relation_type: string;
}
