import { LegajosService } from '@/lib/services/legajos';
import { enableVisualLegajo } from '@/lib/config';
import LegajoHeader from '@/components/legajo/LegajoHeader';
import CounterGrid from '@/components/legajo/CounterGrid';
void [LegajosService, enableVisualLegajo, LegajoHeader, CounterGrid];

export default async function LegajoDetallePage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/legajos/${params.id}`, {
    cache: 'no-store',
  });
  const { data, visual_config, meta } = await res.json();
  const hasVisual = !!(visual_config && Object.keys(visual_config).length);

  const cfg = visual_config || {};

  function getPath(obj: any, path?: string) {
    if (!obj || !path) return '';
    return path.split('.').reduce((o, k) => (o as any)?.[k], obj) ?? '';
  }
  function tpl(tplStr: string, ctx: any) {
    return (tplStr || '').replace(/{{\s*([^}]+)\s*}}/g, (_, p) => String(getPath(ctx, p.trim())));
  }

  if (!hasVisual) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Legajo</h1>
        <div className="space-y-1 text-sm">
          <div>
            <strong>Plantilla:</strong> {meta?.plantilla || ''}
          </div>
        </div>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {cfg.header ? (
        <div className="rounded-xl border p-6">
          <h1 className="text-2xl font-semibold">
            {tpl(cfg.header.title || '', { data, meta })}
          </h1>
          {cfg.header.subtitle && (
            <p className="text-slate-600">{cfg.header.subtitle}</p>
          )}
        </div>
      ) : null}

      {cfg.counters?.items?.length ? (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}
        >
          {cfg.counters.items.map((c: any) => (
            <div key={c.id} className="rounded-lg border p-4">
              <div className="text-sm text-slate-500">{c.label}</div>
              <div className="text-2xl font-semibold">
                {tpl(c.value || '', { data, meta })}
              </div>
              {c.trend && <div className="text-xs text-slate-500">{c.trend}</div>}
            </div>
          ))}
        </div>
      ) : null}

      {/* …aquí sigue tu render clásico de secciones/campos */}
    </div>
  );
}
