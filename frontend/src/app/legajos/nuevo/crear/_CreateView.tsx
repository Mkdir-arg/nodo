"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DynamicForm from "@/components/form/runtime/DynamicForm";

import { getApiBaseUrl } from "@/lib/env";

async function fetchPlantilla(id: string) {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("No se pudo resolver la URL de la API");
  }
  const res = await fetch(new URL(`/api/plantillas/${id}`, base).toString(), {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("No se pudo cargar la plantilla");
  }
  return res.json();
}

async function createLegajo(payload: { plantilla_id: string; data: any }) {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("No se pudo resolver la URL de la API");
  }
  const res = await fetch(new URL(`/api/legajos`, base).toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "No se pudo crear el legajo");
  }
  return res.json();

}

export default function CreateView({ formId }: { formId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
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
