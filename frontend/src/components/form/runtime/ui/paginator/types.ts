export interface UIPaginatorConfig {
  pages: Array<{
    id: string;
    title?: string;
    description?: string;
    fieldKeys: string[];
  }>;
  behavior: {
    create: "wizard";
    view: "sections";
    edit?: "wizard" | "sections";
  };
  initial_page?: number;
  show_progress?: boolean;
  allow_jump?: boolean;
  sticky_nav?: boolean;
  labels?: { next?: string; prev?: string; finish?: string };
  variant?: "stepper" | "tabs" | "progress" | "dots";
  glass?: boolean;
}

export interface UIPaginatorNode {
  id: string;
  kind: "ui";
  type: "ui:paginator";
  ui: { colSpan: number };
  config: UIPaginatorConfig;
}
