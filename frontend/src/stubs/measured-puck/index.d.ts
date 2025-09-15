import type { ReactNode } from "react";

export type PuckFieldType = "text" | "textarea" | "number" | "select" | "checkbox" | "list" | "json" | "date";

export interface PuckFieldOption {
  label: string;
  value: string;
}

export interface FieldConfig<TValue = unknown> {
  type: PuckFieldType;
  label: string;
  helperText?: string;
  placeholder?: string;
  defaultValue?: TValue;
  options?: PuckFieldOption[];
}

export interface ComponentConfig<TProps extends Record<string, unknown> = Record<string, unknown>> {
  label: string;
  description?: string;
  preview?: ReactNode;
  defaultProps?: Partial<TProps>;
  fields: Record<string, FieldConfig>;
  category?: string;
}

export interface CategoryConfig {
  id: string;
  label: string;
  components: string[];
}

export interface Config<TComponents extends Record<string, ComponentConfig> = Record<string, ComponentConfig>> {
  components: TComponents;
  categories: CategoryConfig[];
}

export declare const version: string;
export declare function createPuck(): never;
export declare const Editor: () => never;

export type {
  FieldConfig as PuckFieldConfig,
  ComponentConfig as PuckComponentConfig,
  CategoryConfig as PuckCategoryConfig,
  Config as PuckConfig,
};
