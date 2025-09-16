"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlantillaLayoutQueryOptions } from "@/lib/api/plantillas";
import { DynamicFormRenderer } from "@/lib/forms/runtime/DynamicFormRenderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: { id: string };
}

export default function RenderPage({ params }: PageProps) {
  const { data: plantilla, isLoading, error } = useQuery(
    getPlantillaLayoutQueryOptions(params.id)
  );

  const handleSubmit = (data: any) => {
    console.log("Datos del formulario:", data);
    // Aquí iría la lógica de envío al backend
    alert("Formulario enviado correctamente");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Error al cargar la plantilla</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plantilla?.layout.nodes.length) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Esta plantilla no tiene campos configurados</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Formulario Dinámico</CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicFormRenderer
            layout={plantilla.layout}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}