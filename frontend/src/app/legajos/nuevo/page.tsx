"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ListView from "./_ListView";

type PlantillaSummary = {
  nombre?: string;
};

async function fetchPlantilla(formId: string): Promise<PlantillaSummary | null> {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`http://localhost:8000/api/plantillas/${formId}/`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      console.error(`fetchPlantilla: HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return { nombre: data.nombre };
  } catch (error) {
    console.error("fetchPlantilla", error);
    return null;
  }
}

export default function Page() {
  const searchParams = useSearchParams();
  const formId = searchParams?.get('formId');
  
  const { data: plantilla, isLoading } = useQuery({
    queryKey: ['plantilla', formId],
    queryFn: () => formId ? fetchPlantilla(formId) : null,
    enabled: !!formId
  });

  if (!formId) {
    return (
      <div className="p-6">
        Falta <code>formId</code>.
      </div>
    );
  }

  const nombre = plantilla?.nombre ?? (isLoading ? 'Cargando...' : 'Plantilla no encontrada');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Legajos</h1>
          <p className="text-sm opacity-70">Plantilla: {nombre}</p>
        </div>
        <Button asChild>
          <Link href={`/legajos/nuevo/crear?formId=${formId}`}>Crear</Link>
        </Button>
      </div>
      {!plantilla && !isLoading && (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No se pudo cargar la plantilla. Verificá que exista y que tengas permisos.
        </div>
      )}
      <ListView formId={formId} />
    </div>
  );
}
