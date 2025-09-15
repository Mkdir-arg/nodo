"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DynamicForm from "@/components/form/runtime/DynamicForm";

import { getJSON, postJSON } from "@/lib/api";

type PlantillaResponse = {
  schema?: unknown;
};

async function fetchPlantilla(id: string): Promise<PlantillaResponse> {
  return getJSON<PlantillaResponse>(`/api/plantillas/${id}`);
}

async function createLegajo(payload: { plantilla_id: string; data: any }) {
  return postJSON(`/api/legajos`, payload);

}

export default function CreateView({ formId }: { formId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PlantillaResponse>({
    queryKey: ["plantilla", formId],
    queryFn: () => fetchPlantilla(formId),
  });

  const mutation = useMutation({
    mutationFn: createLegajo,
  });

  if (isLoading) {
    return <div>Cargando plantilla…</div>;
  }

  if (error || !data) {
    return <div>Error al cargar la plantilla.</div>;
  }

  const schema = data?.schema ?? { nodes: [] };

  return (
    <DynamicForm
      schema={schema}
      onSubmit={async (values) => {
        if (mutation.isPending) return;
        try {
          await mutation.mutateAsync({ plantilla_id: formId, data: values });
          await queryClient.invalidateQueries({ queryKey: ["legajos", formId] });
          router.push(`/legajos/nuevo?formId=${formId}`);
        } catch (e) {
          console.error(e);
          const message = e instanceof Error ? e.message : "No se pudo crear el legajo";
          alert(message);
        }
      }}
    />
  );
}
