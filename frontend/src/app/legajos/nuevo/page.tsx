import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlantillasService } from "@/lib/services/plantillas";
import ListView from "./_ListView";

type PageProps = {
  searchParams?: {
    formId?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  const formId = searchParams?.formId;

  if (!formId) {
    return (
      <div className="p-6">
        Falta <code>formId</code>.
      </div>
    );
  }

  let plantillaName: string | null = null;
  let fetchFailed = false;

  try {
    const plantilla = await PlantillasService.fetchPlantilla(formId);
    plantillaName = typeof plantilla?.nombre === "string" ? plantilla.nombre : null;
  } catch (error) {
    fetchFailed = true;
    console.error("legajos/nuevo: error fetching plantilla", error);
  }

  const displayName = plantillaName ?? "Plantilla no encontrada";
  const showWarning = fetchFailed || !plantillaName;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Legajos</h1>
          <p className="text-sm opacity-70">Plantilla: {displayName}</p>
        </div>
        <Button asChild>
          <Link href={`/legajos/nuevo/crear?formId=${formId}`}>Crear</Link>
        </Button>
      </div>
      <ListView formId={formId} />
    </div>
  );
}
