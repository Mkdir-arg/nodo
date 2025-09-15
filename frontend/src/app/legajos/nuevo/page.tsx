import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

import { getJSON } from "@/lib/api";
import ListView from "./_ListView";

async function fetchPlantilla(formId: string) {

  try {
    return await getJSON(`/api/plantillas/${formId}`, { cache: "no-store" });
  } catch (error) {
    console.error("fetchPlantilla", error);
    return null;
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: { formId?: string };
}) {
  const formId = searchParams?.formId;
  if (!formId) {
    return (
      <div className="p-6">
        Falta <code>formId</code>.
      </div>
    );
  }

  const plantilla = await fetchPlantilla(formId);
  const nombre = plantilla?.nombre ?? formId;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Legajos — {nombre}</h1>
        <Button asChild>
          <Link href={`/legajos/nuevo/crear?formId=${formId}`}>Crear</Link>
        </Button>
      </div>
      {!plantilla && (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No se pudo cargar la plantilla. Verificá que exista y que tengas permisos.
        </div>
      )}
      <Suspense fallback={<div className="rounded-md border p-4">Cargando…</div>}>
        <ListView formId={formId} />
      </Suspense>
    </div>
  );
}
