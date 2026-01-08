"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import SectionRenderer from "@/components/legajo/SectionRenderer";
import { HeaderNodeRuntime } from "@/components/form/builder/ui-nodes/HeaderNode/HeaderNodeRuntime";
import PaginatorRuntime from "@/components/form/runtime/ui/paginator/PaginatorRuntime";
import { getJSON } from "@/lib/api";
import { RelationsService } from "@/lib/services/relations";
import { FormProvider, useForm } from "react-hook-form";

type LegajoResponse = {
  data?: Record<string, unknown>;
  schema?: {
    nodes?: unknown[];
    sections?: unknown[];
  };
  meta?: Record<string, unknown>;
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
    const relations = node.config?.relations || [];
    return (
      <div key={node.id} className="mb-6 space-y-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">{node.config?.title || 'Relaciones'}</span>
        </div>
        {relations.length === 0 ? (
          <span className="text-sm text-gray-500">Sin relaciones configuradas</span>
        ) : (
          <div className="space-y-4">
            {relations.map((rel: any) => {
              const outgoing = ctx.relationsData?.outgoing?.filter((r: any) => r.relation_type === rel.relation_label) || [];
              const incoming = ctx.relationsData?.incoming?.filter((r: any) => r.relation_type === rel.relation_label) || [];
              return (
                <div key={rel.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">{rel.relation_label}</div>
                  <div className="flex flex-wrap gap-2">
                    {outgoing.length === 0 ? (
                      <span className="text-sm text-gray-500">Sin vínculos</span>
                    ) : (
                      outgoing.map((r: any) => (
                        <a
                          key={r.id}
                          href={`/legajos/${r.target_legajo_id}`}
                          className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200"
                        >
                          {r.target_data?.nombre || r.target_legajo_id}
                        </a>
                      ))
                    )}
                  </div>
                  {incoming.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-gray-600 mb-2">{rel.inverse_relation_label} (inversa)</div>
                      <div className="flex flex-wrap gap-2">
                        {incoming.map((r: any) => (
                          <a
                            key={r.id}
                            href={`/legajos/${r.source_legajo_id}`}
                            className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
                          >
                            {r.source_data?.nombre || r.source_legajo_id}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
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
  const { data: response, isLoading } = useQuery({
    queryKey: ['legajo', params.id],
    queryFn: () => getJSON<LegajoResponse>(`/api/legajos/${params.id}`)
  });

  const { data: relationsData } = useQuery({
    queryKey: ['legajo-relations', params.id],
    queryFn: () => RelationsService.list(params.id)
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
      {/* Renderizar nodos UI no-paginator */}
      {uiNodes.filter(n => n.type !== 'ui:paginator').length > 0 && (
        <div className="space-y-4">
          {uiNodes.filter(n => n.type !== 'ui:paginator').map((node: any) => renderNode(node, ctx))}
        </div>
      )}
      
      {hasPaginator ? (
        // Si hay paginador, usarlo en modo view (sections)
        <FormProvider {...methods}>
          <PaginatorRuntime
            config={paginatorNode.config}
            allNodes={dataNodes}
            mode="view"
          />
        </FormProvider>
      ) : (
        // Sin paginador, renderizado normal
        <>
          {/* Renderizar secciones si existen */}
          {sections.length > 0 && (
            <div className="space-y-8">
              {sections.map((s: any) => (
                <SectionRenderer key={s.id} section={s} ctx={ctx} skipUiNodes={true} />
              ))}
            </div>
          )}
          
          {/* Fallback si no hay nada */}
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
