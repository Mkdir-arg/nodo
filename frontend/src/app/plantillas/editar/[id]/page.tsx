import Builder from '@/components/form/builder/Builder';
import { PlantillasService } from '@/lib/services/plantillas';

export default async function EditarPlantillaPage({ params }:{params:{id:string}}) {
  const plantilla = await PlantillasService.fetchPlantilla(params.id);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Editar plantilla</h1>
      <Builder template={plantilla} />
    </div>
  );
}
