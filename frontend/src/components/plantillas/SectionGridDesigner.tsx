"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import type { Layout } from "react-grid-layout";
import { useBuilderStore } from "@/lib/store/usePlantillaBuilderStore";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const RGL = dynamic<any>(async () => {
  const mod: any = await import("react-grid-layout");
  return mod.WidthProvider(mod.default);
}, { ssr: false });

type Props = {
  section: { id: string; nodes: any[] };
  onUpdateNodes: (nodes: any[]) => void;
};

export default function SectionGridDesigner({ section, onUpdateNodes }: Props) {
  const { selected, setSelected, duplicateNode, removeNode } = useBuilderStore();

  const layout = useMemo<Layout[]>(() => {
    return (section.nodes || []).map((n: any) => ({
      i: n.layout?.i ?? n.id,
      x: n.layout?.x ?? 0,
      y: n.layout?.y ?? 0,
      w: n.layout?.w ?? 6,
      h: n.layout?.h ?? 3,
    }));
  }, [section.nodes]);

  const updateFromLayout = useCallback((next: Layout[]) => {
    const map = new Map(next.map((l) => [l.i, l]));
    const nodes = (section.nodes || []).map((n: any) => {
      const key = n.layout?.i ?? n.id;
      const match = map.get(key) || map.get(n.id);
      if (!match) return n;
      return {
        ...n,
        layout: {
          ...(n.layout || {}),
          i: key,
          x: match.x,
          y: match.y,
          w: match.w,
          h: match.h,
        },
      };
    });
    onUpdateNodes(nodes);
  }, [section.nodes, onUpdateNodes]);

  const handleEdit = (id: string) => {
    window.dispatchEvent(new CustomEvent("builder:open-props", { detail: { id } }));
  };

  return (
    <RGL
      cols={12}
      rowHeight={24}
      margin={[12, 12]}
      compactType="vertical"
      isDraggable
      isResizable
      layout={layout}
      onLayoutChange={updateFromLayout}
    >
      {(section.nodes || []).map((node: any) => {
        const key = node.layout?.i ?? node.id;
        const isSelected = selected?.type === "field" && selected.id === node.id;
        const title = node.config?.title || node.label || node.key || node.id;
        return (
          <div key={key} data-grid={node.layout}>
            <div
              className={`h-full w-full rounded-lg border bg-white p-3 shadow-sm transition ${
                isSelected ? "ring-2 ring-sky-400" : "hover:border-sky-200"
              }`}
              onClick={() => setSelected({ type: "field", id: node.id })}
            >
              <div className="flex items-start justify-between gap-2 text-xs text-slate-500">
                <span className="font-medium uppercase tracking-wide">{node.type}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded border px-2 py-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(node.id);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="rounded border px-2 py-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateNode(node.id);
                    }}
                  >
                    Duplicar
                  </button>
                  <button
                    type="button"
                    className="rounded border px-2 py-0.5 text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNode(node.id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm font-medium truncate text-slate-700">
                {title}
              </div>
            </div>
          </div>
        );
      })}
    </RGL>
  );
}
