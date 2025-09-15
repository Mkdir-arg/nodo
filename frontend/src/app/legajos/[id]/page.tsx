import { LegajosService } from '@/lib/services/legajos';
import { enableVisualLegajo } from '@/lib/config';
import LegajoHeader from '@/components/legajo/LegajoHeader';
import CounterGrid from '@/components/legajo/CounterGrid';

export default async function LegajoDetallePage({ params }:{params:{id:string}}) {
  const legajo: any = await LegajosService.get(params.id);
  const hasVisual =
    enableVisualLegajo && legajo.visual_config && Object.keys(legajo.visual_config).length > 0;

  if (!hasVisual) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Legajo</h1>
        <div className="space-y-1 text-sm">
          <div>
            <strong>Plantilla:</strong> {legajo.plantilla}
          </div>
        </div>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(legajo.data, null, 2)}
        </pre>
      </div>
    );
  }

  const cfg = legajo.visual_config;
  return (
    <div className="space-y-6">
      {cfg.header && (
        <LegajoHeader cfg={cfg.header} data={legajo.data} meta={legajo.meta} />
      )}
      {cfg.counters && (
        <CounterGrid cfg={cfg.counters} data={legajo.data} meta={legajo.meta} />
      )}
    </div>
  );
}
