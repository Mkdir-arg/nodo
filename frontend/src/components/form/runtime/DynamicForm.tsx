"use client";

import { useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { zodFromTemplate } from "../builder/zodFromTemplate";
import DynamicNode from "./DynamicNode";
import { HeaderNodeRuntime } from "../builder/ui-nodes/HeaderNode/HeaderNodeRuntime";
import { Button } from "@/components/ui/button";

// Normaliza distintos formatos y hace fallback seguro
function normalizeSchema(raw: any): { nodes: any[] } {
  if (!raw) return { nodes: [] };
  if (Array.isArray(raw)) return { nodes: raw };
  if (Array.isArray(raw.nodes)) return { nodes: raw.nodes };
  if (Array.isArray(raw.fields)) {
    // Formato legacy: { fields: [...], layout: [...] }
    return { nodes: raw.fields };
  }
  if (Array.isArray(raw.sections)) {
    const nodes = raw.sections.flatMap((s: any) => s?.nodes || s?.fields || []);
    return { nodes: nodes.filter(Boolean) };
  }
  return { nodes: [] };
}

function isUiNode(n:any){ return n?.kind === "ui" || String(n?.type||"").startsWith("ui:"); }

function renderUiNode(node: any, data: any = {}, meta: any = {}) {
  if (node.type === 'ui:header') {
    return (
      <HeaderNodeRuntime 
        key={node.id}
        node={node}
        data={data}
        meta={meta}
        context={{}}
      />
    );
  }
  
  // Otros UI nodes...
  return null;
}

export default function DynamicForm({
  schema,
  initialData = {},
  meta = {},
  onSubmit,
}: {
  schema?: any;
  initialData?: Record<string, any>;
  meta?: Record<string, any>;
  onSubmit: (data: any) => void;
}) {
  const normalized = useMemo(() => normalizeSchema(schema), [schema]);
  const allNodes = normalized.nodes || [];
  const uiNodes = useMemo(() => allNodes.filter((n: any) => isUiNode(n)), [allNodes]);
  const dataNodes = useMemo(() => allNodes.filter((n: any) => !isUiNode(n)), [allNodes]);
  
  const zodSchema = useMemo(
    () => zodFromTemplate(dataNodes),
    [dataNodes]
  );

  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: initialData,
  });

  const formData = methods.watch(); // Para pasar a UI nodes

  // Estado vacío visual si no hay nodos/fields
  if (!allNodes.length) {
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
    <div className="space-y-6">
      {/* Renderizar UI nodes primero */}
      {uiNodes.map((node) => renderUiNode(node, formData, meta))}
      
      {/* Luego el formulario */}
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {dataNodes.map((n:any)=> <DynamicNode key={n.id} node={n} />)}

          <div className="pt-2">
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
