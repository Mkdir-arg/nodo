"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import SectionRenderer from "@/components/legajo/SectionRenderer";
import { HeaderNodeRuntime } from "@/components/form/builder/ui-nodes/HeaderNode/HeaderNodeRuntime";
import PaginatorRuntime from "@/components/form/runtime/ui/paginator/PaginatorRuntime";
import { getJSON } from "@/lib/api";
import RelationRuntime from "@/components/form/runtime/ui/relation/RelationRuntime";
import { FormProvider, useForm } from "react-hook-form";
import { useAnalyticsContextStore } from "@/lib/store/useAnalyticsContextStore";

type LegajoResponse = {
  data?: Record<string, unknown>;
  schema?: {
    nodes?: unknown[];
    sections?: unknown[];
  };
  meta?: Record<string, unknown>;
  plantilla?: string;
};

function isUiNode(n: any) { 
  return n?.kind === "ui" || String(n?.type || "").startsWith("ui:"); 
}

function renderNode(node: any, ctx: any) {
  if (node.type === 'ui:header') {
    return (
      <HeaderNodeRuntime 
        key={node.id}
        node={node}
        data={ctx.data || {}}
        meta={{ ...ctx.meta, legajoId: ctx.legajoId }}
        context={ctx.context || {}}
      />
    );
  }
  
  if (node.type === 'ui:relation') {
    return (
      <RelationRuntime 
        key={node.id}
        config={node.config}
        legajoId={ctx.legajoId}
        mode="view"
      />
    );
  }
  
  // ui:paginator se maneja por separado
  
  // Otros nodos de datos - renderizado básico
  if (!isUiNode(node)) {
    const value = ctx.data?.[node.key];
    return (
      <div key={node.id} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {node.label || node.key}
        </label>
        <div className="text-gray-900">
          {value || '—'}
        </div>
      </div>
    );
  }
  
  return null;
}

export default function LegajoDetallePage({ params }: { params: { id: string } }) {
  const { setContext } = useAnalyticsContextStore();
  const { data: response, isLoading } = useQuery({
    queryKey: ['legajo', params.id],
    queryFn: () => getJSON<LegajoResponse>(`/api/legajos/${params.id}`)
  });

  const { data: relationsData } = useQuery({
    queryKey: ['legajo-relations', params.id],
    queryFn: () => getJSON(`/api/legajos/${params.id}/relations/`)
  });

  const methods = useForm({
    defaultValues: response?.data || {},
    mode: 'onChange'
  });

  // Actualizar form cuando lleguen los datos
  useEffect(() => {
    if (response?.data && Object.keys(response.data).length > 0) {
      methods.reset(response.data);
    }
  }, [response?.data]);

  useEffect(() => {
    if (response?.plantilla) {
      setContext({ plantillaId: response.plantilla, source: 'Legajos / Detalle' });
    }
  }, [response?.plantilla, setContext]);

  if (isLoading) {
    return <div className="p-6">Cargando legajo...</div>;
  }

  if (!response) {
    return <div className="p-6">Error al cargar el legajo.</div>;
  }

  const data = response.data ?? {};
  const schema = response.schema ?? {};
  const meta = response.meta ?? {};
  
  // Usar datos actuales del formulario
  const formData = methods.watch();
  const ctx = { data: Object.keys(formData).length > 0 ? formData : data, meta: { ...meta, legajoId: params.id }, context: {}, legajoId: params.id, relationsData };

  const nodes = schema?.nodes || [];
  const sections = schema?.sections || [];
  
  // Separar nodos UI de nodos de datos
  const uiNodes = nodes.filter((n: any) => isUiNode(n));
  const dataNodes = nodes.filter((n: any) => !isUiNode(n));
  
  // Buscar paginador
  const paginatorNode = uiNodes.find((n: any) => n.type === 'ui:paginator');
  const hasPaginator = !!paginatorNode;

  return (
    <div className="space-y-6">
      {/* Renderizar todos los nodos UI (incluyendo paginador) en un grid */}
      {uiNodes.length > 0 && (
        <div className="grid grid-cols-12 gap-4">
          {uiNodes.map((node: any) => {
            const colSpan = node.colSpan || 12;
            
            if (node.type === 'ui:paginator') {
              return (
                <div key={node.id} style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}>
                  <FormProvider {...methods}>
                    <PaginatorRuntime
                      config={node.config}
                      allNodes={dataNodes}
                      mode="view"
                    />
                  </FormProvider>
                </div>
              );
            }
            
            return (
              <div key={node.id} style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}>
                {renderNode(node, ctx)}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Fallback si no hay paginador ni UI nodes */}
      {uiNodes.length === 0 && (
        <>
          {sections.length > 0 && (
            <div className="space-y-8">
              {sections.map((s: any) => (
                <SectionRenderer key={s.id} section={s} ctx={ctx} skipUiNodes={true} />
              ))}
            </div>
          )}
          
          {sections.length === 0 && dataNodes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay datos para mostrar
            </div>
          )}
        </>
      )}
    </div>
  );
}
