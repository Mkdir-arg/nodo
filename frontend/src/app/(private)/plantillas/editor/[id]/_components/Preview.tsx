"use client";

import {
  type ColumnSpan,
  type FormLayout,
  type LayoutColumnNode,
  type LayoutFieldNode,
  type LayoutRowNode,
} from "@/lib/forms/types";
import DynamicFormRenderer from "@/lib/forms/runtime/DynamicFormRenderer";
import { Button } from "@/components/ui/button";
import { useCanvasGridContext, type CanvasNode } from "./CanvasGrid";
import { useEffect, useMemo, useState } from "react";

const GRID_COLUMNS = 12;

interface PreviewProps {
  open: boolean;
  onClose: () => void;
}

interface PreviewFieldConfig {
  id: string;
  key: string;
  type: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
  step?: number;
  minDate?: string;
  maxDate?: string;
  accept?: string[];
  maxSizeMB?: number;
  defaultValue?: unknown;
}

function toColumnSpan(value: number): ColumnSpan {
  const rounded = Math.round(Number.isFinite(value) ? value : GRID_COLUMNS);
  const clamped = Math.min(GRID_COLUMNS, Math.max(1, rounded));
  return clamped as ColumnSpan;
}

function ensureOptions(options?: Array<{ label?: string; value?: string }>) {
  if (!Array.isArray(options)) return [];
  return options
    .map((option, index) => {
      if (!option) return null;
      const value = option.value ?? option.label;
      if (!value) return null;
      return {
        label: option.label && option.label.length > 0 ? option.label : `Opción ${index + 1}`,
        value,
      };
    })
    .filter((option): option is { label: string; value: string } => Boolean(option));
}

function normalizeAccept(accept?: string[]) {
  if (!Array.isArray(accept)) return undefined;
  const filtered = accept.map((item) => item?.trim()).filter((item): item is string => Boolean(item));
  return filtered.length > 0 ? filtered : undefined;
}

function buildFieldConfig(node: CanvasNode): PreviewFieldConfig {
  const type = typeof node.componentKey === "string" ? node.componentKey.toLowerCase() : "";
  const base: PreviewFieldConfig = {
    id: node.id,
    key: node.name || node.id,
    type,
    label: node.label,
    description: node.description,
    placeholder: node.placeholder,
    required: node.required,
  };

  if (type === "number") {
    return {
      ...base,
      min: node.min,
      max: node.max,
      step: node.step,
    };
  }

  if (["select", "dropdown", "select_with_filter", "radio"].includes(type)) {
    return {
      ...base,
      options: ensureOptions(node.options),
    };
  }

  if (type === "multiselect") {
    return {
      ...base,
      options: ensureOptions(node.options),
      defaultValue: [],
    };
  }

  if (["date", "datetime", "datetime-local"].includes(type)) {
    return {
      ...base,
      minDate: node.minDate,
      maxDate: node.maxDate,
    };
  }

  if (["checkbox", "switch", "boolean"].includes(type)) {
    return {
      ...base,
      defaultValue: false,
    };
  }

  if (["file", "document"].includes(type)) {
    return {
      ...base,
      accept: normalizeAccept(node.accept),
      maxSizeMB: node.maxSizeMB,
    };
  }

  return base;
}

function buildRowLayout(nodes: CanvasNode[], rowIndex: number): LayoutRowNode {
  const rowNodes = nodes
    .map((node) => ({
      node,
      col: Number.isFinite(node.col) ? Number(node.col) : 0,
    }))
    .sort((a, b) => a.col - b.col)
    .map((entry) => entry.node);

  const columns: LayoutColumnNode[] = [];
  let cursor = 0;

  rowNodes.forEach((node, index) => {
    const rawCol = Number.isFinite(node.col) ? Number(node.col) : 0;
    const start = Math.max(0, Math.round(rawCol));
    const span = toColumnSpan(node.colSpan);
    const effectiveStart = Math.max(cursor, start);
    const gap = effectiveStart - cursor;
    if (gap > 0) {
      columns.push({
        id: `preview-row-${rowIndex}-spacer-${index}`,
        type: "column",
        span: toColumnSpan(gap),
        children: [],
      });
      cursor += gap;
    }

    const column: LayoutColumnNode = {
      id: `preview-row-${rowIndex}-column-${index}`,
      type: "column",
      span,
      children: [
        {
          id: `preview-field-${node.id}`,
          type: "field",
          fieldId: node.id,
          fieldKey: node.name || node.id,
          colSpan: span,
        } satisfies LayoutFieldNode,
      ],
    };

    columns.push(column);
    cursor = Math.min(GRID_COLUMNS, effectiveStart + span);
  });

  return {
    id: `preview-row-${rowIndex}`,
    type: "row",
    columns,
  } satisfies LayoutRowNode;
}

function buildPreviewLayout(nodes: CanvasNode[]): FormLayout {
  if (!nodes.length) {
    return { version: 1, nodes: [] };
  }

  const grouped = new Map<number, CanvasNode[]>();
  nodes.forEach((node) => {
    const rawRow = Number.isFinite(node.row) ? Number(node.row) : 0;
    const rowIndex = Math.max(0, Math.round(rawRow));
    const collection = grouped.get(rowIndex);
    if (collection) {
      collection.push(node);
    } else {
      grouped.set(rowIndex, [node]);
    }
  });

  const sortedRows = Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
  const rowLayouts = sortedRows.map(([rowIndex, rowNodes]) => buildRowLayout(rowNodes, rowIndex));

  return {
    version: 1,
    nodes: rowLayouts,
  } satisfies FormLayout;
}

export default function Preview({ open, onClose }: PreviewProps) {
  const { nodes } = useCanvasGridContext();
  const [submitResult, setSubmitResult] = useState<Record<string, unknown> | null>(null);

  const layout = useMemo(() => buildPreviewLayout(nodes), [nodes]);
  const fields = useMemo(() => nodes.map((node) => buildFieldConfig(node)), [nodes]);

  useEffect(() => {
    if (!open) {
      setSubmitResult(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10 sm:py-16" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-white/80 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Vista previa del formulario</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Probá el formulario como lo verán los usuarios. Los datos ingresados no se guardan en la plantilla.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="shrink-0">
            Cerrar
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          <div className="mx-auto w-full max-w-2xl space-y-6">
            <DynamicFormRenderer
              layout={layout}
              fields={fields}
              submitLabel="Simular envío"
              onSubmit={(values) => setSubmitResult(values)}
              className="space-y-8"
            />

            {submitResult ? (
              <section className="rounded-xl border border-emerald-300/70 bg-emerald-50/80 p-4 text-sm text-emerald-700 shadow-sm dark:border-emerald-600/60 dark:bg-emerald-900/40 dark:text-emerald-200">
                <header className="mb-2 font-semibold">Resultado de la simulación</header>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-200/80">
                  Validación exitosa. Estos serían los valores enviados:
                </p>
                <pre className="mt-3 max-h-60 overflow-auto rounded-lg bg-black/5 p-3 text-xs text-slate-800 dark:bg-black/30 dark:text-slate-200">
                  {JSON.stringify(submitResult, (_, value) => {
                    if (value instanceof Date) {
                      return value.toISOString();
                    }
                    return value;
                  }, 2)}
                </pre>
              </section>
            ) : (
              <section className="rounded-xl border border-dashed border-slate-300/80 bg-white/60 p-4 text-xs text-slate-500 dark:border-slate-600/60 dark:bg-slate-900/40 dark:text-slate-400">
                Completá el formulario y presioná “Simular envío” para verificar las validaciones.
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
