"use client";

import { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { zodFromTemplate } from "../builder/zodFromTemplate";
import DynamicNode from "./DynamicNode";
import { HeaderNodeRuntime } from "../builder/ui-nodes/HeaderNode/HeaderNodeRuntime";
import PaginatorRuntime from "./ui/paginator/PaginatorRuntime";
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
  
  // ui:paginator se maneja por separado en el flujo principal
  
  // Otros UI nodes...
  return null;
}

export default function DynamicForm({
  schema,
  initialData = {},
  meta = {},
  onSubmit,
  mode = 'create',
}: {
  schema?: any;
  initialData?: Record<string, any>;
  meta?: Record<string, any>;
  onSubmit: (data: any) => void;
  mode?: 'create' | 'view' | 'edit';
}) {
  const normalized = useMemo(() => normalizeSchema(schema), [schema]);
  const allNodes = normalized.nodes || [];
  const uiNodes = useMemo(() => allNodes.filter((n: any) => isUiNode(n)), [allNodes]);
  const dataNodes = useMemo(() => allNodes.filter((n: any) => !isUiNode(n)), [allNodes]);
  
  // Buscar si hay un paginador
  const paginatorNode = uiNodes.find((n: any) => n.type === 'ui:paginator');
  const hasPaginator = !!paginatorNode;
  
  const zodSchema = useMemo(
    () => zodFromTemplate(dataNodes),
    [dataNodes]
  );

  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: initialData,
  });

  // Validar página del paginador usando RHF trigger
  const validatePage = async (pageIndex: number) => {
    if (!paginatorNode) return true;
    const page = paginatorNode.config.pages[pageIndex];
    const fieldKeys = page?.fieldKeys || [];
    
    // Usar trigger de RHF para validar con Zod
    const result = await methods.trigger(fieldKeys);
    return result;
  };

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
      {/* Renderizar UI nodes no-paginator primero */}
      {uiNodes.filter(n => n.type !== 'ui:paginator').map((node) => renderUiNode(node, methods.watch(), meta))}
      
      {/* Formulario */}
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {hasPaginator ? (
            // Si hay paginador, usarlo
            <PaginatorRuntime
              config={paginatorNode.config}
              allNodes={dataNodes}
              mode={mode}
              onValidatePage={validatePage}
            />
          ) : (
            // Sin paginador, renderizar campos normalmente
            <>
              {dataNodes.map((n:any)=> <DynamicNode key={n.id} node={n} />)}
              <div className="pt-2">
                <Button type="submit">Guardar</Button>
              </div>
            </>
          )}
        </form>
      </FormProvider>
    </div>
  );
}
