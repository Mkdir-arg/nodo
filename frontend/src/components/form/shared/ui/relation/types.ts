export interface UIRelationItem {
  id: string;
  relation_label: string;
  inverse_relation_label: string;
}

export interface UIRelationConfig {
  title?: string;
  description?: string;
  target_template_id: string;
  target_template_name?: string;
  cardinality: "one_to_one" | "one_to_many" | "many_to_one" | "many_to_many";
  selection: {
    max_items?: number;
    required?: boolean;
  };
  search?: {
    display_template?: string;
    searchable_keys?: string[];
  };
  relations: UIRelationItem[];
}

export interface UIRelationNode {
  id: string;
  kind: "ui";
  type: "ui:relation";
  config: UIRelationConfig;
  layout?: any;
}
