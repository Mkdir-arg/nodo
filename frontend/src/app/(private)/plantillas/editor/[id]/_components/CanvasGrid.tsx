import { useMemo } from "react";

import type {
  FormLayout,
  LayoutColumnNode,
  LayoutFieldNode,
  LayoutRowNode,
  LayoutSectionNode,
} from "@/lib/forms/types";

interface CanvasGridProps {
  layout: FormLayout;
  isEmpty: boolean;
  primarySection: LayoutSectionNode | LayoutRowNode | null;
}

interface LayoutSummary {
  sections: number;
  rows: number;
  fields: number;
}

function countLayoutNodes(layout: FormLayout): LayoutSummary {
  const summary: LayoutSummary = { sections: 0, rows: 0, fields: 0 };

  const visitNodes = (nodes: Array<LayoutSectionNode | LayoutRowNode | LayoutColumnNode | LayoutFieldNode>) => {
    nodes.forEach((node) => {
      if (!node) return;
      switch (node.type) {
        case "section":
          summary.sections += 1;
          visitNodes(node.children);
          break;
        case "row":
          summary.rows += 1;
          node.columns.forEach((column) => visitNodes(column.children));
          break;
        case "column":
          visitNodes(node.children);
          break;
        case "field":
          summary.fields += 1;
          break;
        default:
          break;
      }
    });
  };

  visitNodes(layout.nodes ?? []);

  return summary;
}

export default function CanvasGrid({ layout, isEmpty, primarySection }: CanvasGridProps) {
  const serializedLayout = useMemo(() => JSON.stringify(layout, null, 2), [layout]);
  const summary = useMemo(() => countLayoutNodes(layout), [layout]);

  const primarySectionTitle = useMemo(() => {
    if (!primarySection) return "";
    if (primarySection.type === "section") {
      return primarySection.title || "Sección sin título";
    }
    return "Diseño sin secciones";
  }, [primarySection]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Lienzo</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visualizá la estructura actual del layout.
          </p>
        </div>
        <dl className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col items-center">
            <dt className="uppercase tracking-wide">Secciones</dt>
            <dd className="text-sm font-semibold text-slate-700 dark:text-slate-200">{summary.sections}</dd>
          </div>
          <div className="flex flex-col items-center">
            <dt className="uppercase tracking-wide">Filas</dt>
            <dd className="text-sm font-semibold text-slate-700 dark:text-slate-200">{summary.rows}</dd>
          </div>
          <div className="flex flex-col items-center">
            <dt className="uppercase tracking-wide">Campos</dt>
            <dd className="text-sm font-semibold text-slate-700 dark:text-slate-200">{summary.fields}</dd>
          </div>
        </dl>
      </header>

      <div className="mt-4 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-950/40">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-xs text-slate-500 dark:text-slate-400">
            El layout aún no contiene nodos. Arrastrá componentes desde la paleta para comenzar.
          </div>
        ) : (
          <div className="flex h-full flex-col overflow-hidden">
            {primarySection ? (
              <div className="border-b border-slate-200 bg-slate-100/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                {primarySectionTitle}
              </div>
            ) : null}
            <pre className="flex-1 overflow-auto bg-transparent p-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {serializedLayout}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
