import { LegajosService } from '@/lib/LegajosService';

export default async function LegajoDetallePage({ params }:{params:{id:string}}) {
  const legajo = await LegajosService.fetchLegajo(params.id);
  return (
    <div className="space-y-2">
      <h1 className="text-2xl">Legajo</h1>
      <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(legajo.data, null, 2)}</pre>
    </div>
  );
}
