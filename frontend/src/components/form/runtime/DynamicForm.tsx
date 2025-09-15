"use client";

import { useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { zodFromTemplate } from "../builder/zodFromTemplate";
import DynamicNode from "./DynamicNode";
import { Button } from "@/components/ui/button";

// Normaliza distintos formatos y hace fallback seguro
function normalizeSchema(raw: any): { nodes: any[] } {
  if (!raw) return { nodes: [] };
  if (Array.isArray(raw)) return { nodes: raw };
  if (Array.isArray(raw.nodes)) return { nodes: raw.nodes };
  if (Array.isArray(raw.fields)) return { nodes: raw.fields };
  if (Array.isArray(raw.sections)) {
    const nodes = raw.sections.flatMap((s: any) => s?.nodes || s?.fields || []);
    return { nodes: nodes.filter(Boolean) };
  }
  return { nodes: [] };
}

function isUiNode(n:any){ return n?.kind === "ui" || String(n?.type||"").startsWith("ui:"); }

export default function DynamicForm({
  schema,
  onSubmit,
}: {
  schema?: any; // ← ahora es opcional (puede venir undefined)
  onSubmit: (data: any) => void;
}) {
  const normalized = useMemo(() => normalizeSchema(schema), [schema]);
  const nodes = useMemo(()=> (normalized.nodes || []).filter((n:any)=> !isUiNode(n)), [normalized.nodes]);
  const zodSchema = useMemo(
    () => zodFromTemplate(nodes),
    [nodes]
  );

  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {}, // opcional: podés hidratar con valores por defecto
  });

  // Estado vacío visual si no hay nodos/fields
  if (!normalized.nodes.length) {
    return (
      <div className="rounded-xl border p-6 text-sm">
        <p className="text-muted-foreground">
          Esta plantilla aún no tiene campos. Agregá componentes desde el
          constructor y guardá la plantilla.
        </p>
        <div className="mt-4">
          <Button asChild variant="secondary" size="sm">
            <a href="/plantillas">Ir al constructor de plantillas</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {nodes.map((n:any)=> <DynamicNode key={n.id} node={n} />)}

        <div className="pt-2">
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </FormProvider>
  );
}
