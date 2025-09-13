'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PlantillasService } from '@/lib/PlantillasService';
import { LegajosService } from '@/lib/LegajosService';
import DynamicForm from '@/components/form/runtime/DynamicForm';

export default function NuevoLegajoPage() {
  const params = useSearchParams();
  const plantillaId = params.get('plantillaId');
  const { data } = useQuery<any>({
    queryKey: ['plantilla', plantillaId],
    queryFn: () => PlantillasService.fetchPlantilla(plantillaId!),
    enabled: !!plantillaId,
  });
  const router = useRouter();
  if (!plantillaId) return <div>Falta plantillaId</div>;
  if (!data) return <div>Cargando...</div>;
  return (
    <DynamicForm
      schema={data.schema}
      onSubmit={async (values) => {
        const res: any = await LegajosService.createLegajo({ plantilla: data.id, data: values });
        router.push(`/legajos/${res.id}`);
      }}
    />
  );
}
