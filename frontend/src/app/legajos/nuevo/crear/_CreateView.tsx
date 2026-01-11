"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DynamicForm from "@/components/form/runtime/DynamicForm";
import { RelationProvider, useRelationContext } from "@/components/form/runtime/ui/relation/RelationRuntime";
import { RelationsService } from "@/lib/services/relations";

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

function CreateViewInner({ formId }: { formId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { pendingRelations } = useRelationContext();

  const { data, isLoading, error } = useQuery<PlantillaResponse>({
    queryKey: ["plantilla", formId],
    queryFn: () => fetchPlantilla(formId),
  });

  const mutation = useMutation({
    mutationFn: createLegajo,
  });

  if (isLoading) {
    return <div>Cargando plantilla...</div>;
  }

  if (error || !data) {
    return <div>Error al cargar la plantilla.</div>;
  }

  const schema = data?.schema ?? { nodes: [] };

  return (
    <DynamicForm
      schema={schema}
      meta={{ legajoId: "nuevo", plantillaId: formId }}
      mode="create"
      onSubmit={async (values) => {
        if (mutation.isPending) return;
        try {
          const result: any = await mutation.mutateAsync({ plantilla_id: formId, data: values });
          const newLegajoId = result.id;

          if (pendingRelations.length > 0 && newLegajoId) {
            await Promise.all(
              pendingRelations.map(rel =>
                RelationsService.create(newLegajoId, {
                  target_legajo_id: rel.targetId,
                  relation_type: rel.relationType,
                  inverse_relation_type: rel.inverseRelationType
                })
              )
            );
          }

          await queryClient.invalidateQueries({ queryKey: ["legajos"] });
          await queryClient.invalidateQueries({ queryKey: ["plantillas"] });
          alert("Legajo creado exitosamente");
          router.push(`/legajos/${newLegajoId}`);
        } catch (e) {
          console.error(e);
          const message = e instanceof Error ? e.message : "No se pudo crear el legajo";
          alert(message);
        }
      }}
    />
  );
}

export default function CreateView({ formId }: { formId: string }) {
  return (
    <RelationProvider>
      <CreateViewInner formId={formId} />
    </RelationProvider>
  );
}
