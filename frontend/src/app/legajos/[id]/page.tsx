
import SectionRenderer from "@/components/legajo/SectionRenderer";
import { HeaderNodeRuntime } from "@/components/form/builder/ui-nodes/HeaderNode/HeaderNodeRuntime";
import { getJSON } from "@/lib/api";

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
        meta={ctx.meta || {}}
        context={ctx.context || {}}
      />
    );
  }
  
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

export default async function LegajoDetallePage({ params }: { params: { id: string } }) {
  const response = await getJSON<LegajoResponse>(`/api/legajos/${params.id}`, { cache: "no-store" });

  const data = response.data ?? {};
  const schema = response.schema ?? {};
  const meta = response.meta ?? {};
  const ctx = { data, meta, context: {} };

  const nodes = schema?.nodes || [];
  const sections = schema?.sections || [];

  return (
    <div className="space-y-6">
      {/* Renderizar nodos individuales si existen */}
      {nodes.length > 0 && (
        <div className="space-y-4">
          {nodes.map((node: any) => renderNode(node, ctx))}
        </div>
      )}
      
      {/* Renderizar secciones si existen */}
      {sections.length > 0 && (
        <div className="space-y-8">
          {sections.map((s: any) => (
            <SectionRenderer key={s.id} section={s} ctx={ctx} />
          ))}
        </div>
      )}
      
      {/* Fallback si no hay nada */}
      {nodes.length === 0 && sections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos para mostrar
        </div>
      )}
    </div>
  );
}
