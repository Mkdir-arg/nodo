'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlantillasService } from '@/lib/services/plantillas';
import { LegajosService } from '@/lib/services/legajos';
import DynamicForm from '@/components/form/runtime/DynamicForm';

export default function NuevoLegajoPage() {
  const params = useSearchParams();
  const router = useRouter();
  const q = useQueryClient();

  const formId = params.get('formId') || '';
  const { data, isLoading, error } = useQuery({
    queryKey: ['plantilla', formId],
    enabled: !!formId,
    queryFn: () => PlantillasService.fetchPlantilla(formId),
  });

  const mut = useMutation({
    mutationFn: (payload: any) => LegajosService.create(payload),
    onSuccess: () => {
      alert('Legajo creado');
      q.invalidateQueries({ queryKey: ['legajos', 'list'] });
      router.push('/legajos'); // TODO: página de listado de legajos
    },
    onError: (e: any) => alert(e?.message || 'Error al crear el legajo'),
  });

  if (!formId) return <div className="p-6">Falta <code>formId</code> en la URL.</div>;
  if (isLoading) return <div className="p-6">Cargando…</div>;
  if (error || !data) return <div className="p-6">Error cargando la plantilla.</div>;

  // normalizar schema (acepta .schema.nodes o .nodes)
  const template = data.schema?.id
    ? data.schema
    : { id: data.id, name: data.nombre, nodes: data.schema?.nodes ?? data.nodes ?? [] };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Nuevo legajo — {data.nombre}</h1>
      <DynamicForm
        template={template}
        onSubmit={(values) =>
          mut.mutate({ formulario: data.id, data: values }) // TODO: manejar archivos (multipart)
        }
      />
    </div>
  );
}
