"use client";

import dynamic from "next/dynamic";
import type { Layout } from "react-grid-layout";
import { useMemo } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const RGL = dynamic(async () => {
  const mod: any = await import("react-grid-layout");
  return mod.WidthProvider(mod.default);
}, { ssr: false });

type Props = {
  section: any;
  ctx: any;
  renderField: (node: any, ctx: any) => React.ReactNode;
  renderUi: (node: any, ctx: any) => React.ReactNode;
};

export default function SectionGridView({ section, ctx, renderField, renderUi }: Props) {
  const nodes = section?.nodes || section?.children || [];
  const layout = useMemo<Layout[]>(() => {
    return nodes.map((n: any) => ({
      i: n.layout?.i ?? n.id,
      x: n.layout?.x ?? 0,
      y: n.layout?.y ?? 0,
      w: n.layout?.w ?? 6,
      h: n.layout?.h ?? 3,
    }));
  }, [nodes]);

  return (
    <RGL
      cols={12}
      rowHeight={24}
      margin={[12, 12]}
      isDraggable={false}
      isResizable={false}
      compactType="vertical"
      layout={layout}
    >
      {nodes.map((node: any) => {
        const key = node.layout?.i ?? node.id;
        const fallback = layout.find((l) => l.i === key) ?? { i: key, x: 0, y: 0, w: 6, h: 3 };
        const dataGrid = node.layout ? { ...fallback, ...node.layout, i: key } : fallback;
        return (
          <div key={key} data-grid={dataGrid}>
            {node.kind === "ui" || String(node.type || "").startsWith("ui:")
              ? renderUi(node, ctx)
              : renderField(node, ctx)}
          </div>
        );
      })}
    </RGL>
  );
}
