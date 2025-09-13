import { LegajosService } from '@/lib/services/legajos';

export default async function LegajoDetallePage({ params }:{params:{id:string}}) {
  const legajo: any = await LegajosService.get(params.id);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Legajo</h1>
      <div className="space-y-1 text-sm">
        <div><strong>Plantilla:</strong> {legajo.plantilla}</div>
        <div><strong>Creado:</strong> {new Date(legajo.created_at).toLocaleString()}</div>
        <div><strong>Actualizado:</strong> {new Date(legajo.updated_at).toLocaleString()}</div>
      </div>
      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
        {JSON.stringify(legajo.data, null, 2)}
      </pre>
    </div>
  );
}
