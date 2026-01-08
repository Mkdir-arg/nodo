"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DynamicForm from "@/components/form/runtime/DynamicForm";
import { getJSON, putJSON } from "@/lib/api";

type LegajoResponse = {
  data?: Record<string, unknown>;
  schema?: {
    nodes?: unknown[];
    sections?: unknown[];
  };
  meta?: Record<string, unknown>;
  plantilla?: string;
};

async function fetchLegajo(id: string): Promise<LegajoResponse> {
  return getJSON<LegajoResponse>(`/api/legajos/${id}`);
}

async function updateLegajo(id: string, payload: { data: any; plantilla_id: string }) {
  return putJSON(`/api/legajos/${id}/`, payload);
}

export default function EditLegajoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<LegajoResponse>({
    queryKey: ["legajo", params.id],
    queryFn: () => fetchLegajo(params.id),
  });

  const mutation = useMutation({
    mutationFn: (values: any) => updateLegajo(params.id, {
      data: values,
      plantilla_id: data?.plantilla || ''
    }),
  });

  if (isLoading) {
    return <div className="p-6">Cargando legajo…</div>;
  }

  if (error || !data) {
    return <div className="p-6">Error al cargar el legajo.</div>;
  }

  const schema = data?.schema ?? { nodes: [] };
  const initialData = data?.data ?? {};

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar legajo</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
      
      <DynamicForm
        schema={schema}
        initialData={initialData}
        meta={{ legajoId: params.id, plantillaId: data?.plantilla }}
        mode="edit"
        legajoId={params.id}
        onSubmit={async (values) => {
          if (mutation.isPending) return;
          try {
            await mutation.mutateAsync(values);
            await queryClient.invalidateQueries({ queryKey: ["legajo", params.id] });
            await queryClient.invalidateQueries({ queryKey: ["legajos"] });
            alert("Legajo actualizado exitosamente");
            router.push(`/legajos/${params.id}`);
          } catch (e) {
            console.error(e);
            const message = e instanceof Error ? e.message : "No se pudo actualizar el legajo";
            alert(message);
          }
        }}
      />
    </div>
  );
}