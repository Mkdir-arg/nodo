"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { repo } from "@/lib/legajos/repo";
import { FieldsEditor } from "./FieldsEditor";

export default function EditorClient({ plantillaId }: { plantillaId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const { data: template, isLoading } = useQuery({
    queryKey: ['template', plantillaId],
    queryFn: () => repo.getTemplate(plantillaId)
  });

  // Actualizar estado cuando cambie la data
  useEffect(() => {
    if (template) {
      setNombre(template.name);
      setDescripcion(template.description || "");
    }
  }, [template]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!template) throw new Error("No template");
      return repo.upsertTemplate({
        ...template,
        name: data.nombre,
        description: data.descripcion
      });
    },
    onSuccess: () => {
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['template'] });
      queryClient.invalidateQueries({ queryKey: ['plantillas'] });
      queryClient.invalidateQueries({ queryKey: ['legajos'] });
      alert("Plantilla actualizada exitosamente");
      router.push("/plantillas");
    }
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Plantilla no encontrada</h1>
          <p className="text-gray-600 mb-4">La plantilla que buscas no existe o no tienes permisos para verla.</p>
          <button
            onClick={() => router.push("/plantillas")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a Plantillas
          </button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!template) return;
    
    updateMutation.mutate({
      ...template,
      name: nombre.trim(),
      description: descripcion.trim()
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Plantilla</h1>
        <p className="text-gray-600">Modifica los detalles de la plantilla</p>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la plantilla
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingresa el nombre de la plantilla"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe el propósito de esta plantilla"
          />
        </div>

        {/* Editor de campos */}
        <FieldsEditor 
          fields={template.fields || []} 
          onChange={(fields) => {
            // Actualizar template con nuevos campos
            const updatedTemplate = { ...template, fields };
            queryClient.setQueryData(['template', plantillaId], updatedTemplate);
            // Guardar automáticamente los cambios
            repo.upsertTemplate(updatedTemplate).then(() => {
              queryClient.invalidateQueries({ queryKey: ['template'] });
              queryClient.invalidateQueries({ queryKey: ['plantillas'] });
            });
          }}
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => router.push("/plantillas")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!nombre.trim() || updateMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}