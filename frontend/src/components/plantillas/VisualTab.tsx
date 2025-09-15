"use client";
import { useTemplateStore } from "@/stores/templateStore";
import { useMemo } from "react";

export default function VisualTab() {
  const { visualConfig, setVisual } = useTemplateStore();
  const header = useMemo(() => visualConfig.header ?? {}, [visualConfig.header]);
  const counters = visualConfig.counters ?? { layout: "grid-4", items: [] };

  return (
    <div className="space-y-16">
      {/* Encabezado */}
      <section className="rounded-lg border p-16">
        <h3 className="font-medium mb-12">Encabezado</h3>

        <div className="grid gap-12" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          <label className="flex flex-col gap-4">
            <span className="text-sm">Variante</span>
            <select
              defaultValue={header.variant ?? "card"}
              onChange={(e) => setVisual({ render_mode: "visual", header: { ...header, variant: e.target.value as any } })}
              className="border rounded-md h-12 px-4"
            >
              <option value="hero">hero</option>
              <option value="card">card</option>
              <option value="compact">compact</option>
            </select>
          </label>

          <label className="flex flex-col gap-4">
            <span className="text-sm">Título (plantilla)</span>
            <input
              className="border rounded-md h-12 px-4"
              placeholder='{{ data.ciudadano.apellido }}, {{ data.ciudadano.nombre }}'
              defaultValue={header.title ?? ""}
              onChange={(e) => setVisual({ render_mode: "visual", header: { ...header, title: e.target.value } })}
            />
          </label>

          <label className="flex flex-col gap-4">
            <span className="text-sm">Subtítulo</span>
            <input
              className="border rounded-md h-12 px-4"
              placeholder="Legajo de Ciudadano"
              defaultValue={header.subtitle ?? ""}
              onChange={(e) => setVisual({ render_mode: "visual", header: { ...header, subtitle: e.target.value } })}
            />
          </label>
        </div>
      </section>

      {/* KPIs */}
      <section className="rounded-lg border p-16">
        <div className="flex items-center justify-between mb-12">
          <h3 className="font-medium">Contadores / KPIs</h3>
          <button
            type="button"
            className="h-10 px-4 rounded-md border"
            onClick={() => {
              const items = counters.items ?? [];
              const next = { id: `kpi_${items.length + 1}`, label: "Nuevo KPI", value: "{{ counts.intervenciones }}" };
              setVisual({ render_mode: "visual", counters: { layout: counters.layout ?? "grid-4", items: [...items, next] } });
            }}
          >
            Agregar KPI
          </button>
        </div>

        <div className="space-y-8">
          {(counters.items ?? []).map((kpi, i) => (
            <div key={kpi.id} className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              <input
                className="border rounded-md h-12 px-4"
                placeholder="Etiqueta"
                defaultValue={kpi.label}
                onChange={(e) => {
                  const copy = [...(counters.items ?? [])];
                  copy[i] = { ...kpi, label: e.target.value };
                  setVisual({ counters: { ...counters, items: copy } });
                }}
              />
              <input
                className="border rounded-md h-12 px-4"
                placeholder='{{ counts.intervenciones }}'
                defaultValue={kpi.value}
                onChange={(e) => {
                  const copy = [...(counters.items ?? [])];
                  copy[i] = { ...kpi, value: e.target.value };
                  setVisual({ counters: { ...counters, items: copy } });
                }}
              />
              <button
                type="button"
                className="h-12 px-4 rounded-md border"
                onClick={() => {
                  const copy = (counters.items ?? []).filter((_, idx) => idx !== i);
                  setVisual({ counters: { ...counters, items: copy } });
                }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
