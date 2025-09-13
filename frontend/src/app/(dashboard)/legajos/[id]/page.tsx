import { LegajosService } from '@/lib/LegajosService';
import { PlantillasService } from '@/lib/PlantillasService';

export default async function LegajoDetallePage({ params }:{params:{id:string}}) {
  const legajo = await LegajosService.fetchLegajo(params.id);
  const plantilla = await PlantillasService.fetchPlantilla(legajo.plantilla);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Legajo · {plantilla.nombre}</h1>
      <div className="space-y-1 text-sm">
        <div><strong>Plantilla:</strong> {plantilla.nombre} (v{plantilla.version})</div>
        <div><strong>Creado:</strong> {new Date(legajo.created_at).toLocaleString()}</div>
        <div><strong>Actualizado:</strong> {new Date(legajo.updated_at).toLocaleString()}</div>
      </div>
      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
        {JSON.stringify(legajo.data, null, 2)}
      </pre>
    </div>
  );
}
