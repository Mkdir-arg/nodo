'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { PlantillasService } from '@/lib/PlantillasService';
import { LegajosService } from '@/lib/LegajosService';
import DynamicForm from '@/components/form/runtime/DynamicForm';

export default function NuevoLegajoPage() {
  const params = useSearchParams();
  const plantillaId = params.get('plantillaId');
  const { data } = useSWR(plantillaId?`/plantillas/${plantillaId}`:null, ()=>PlantillasService.fetchPlantilla(plantillaId!));
  const router = useRouter();
  if(!plantillaId) return <div>Falta plantillaId</div>;
  if(!data) return <div>Cargando...</div>;
  return <DynamicForm schema={data.schema} onSubmit={async (values)=>{
    const res = await LegajosService.createLegajo({plantilla: data.id, data: values});
    router.push(`/legajos/${res.id}`);
  }} />;
}
