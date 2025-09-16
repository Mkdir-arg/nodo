"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Builder from '@/components/form/builder/Builder';
import BuilderHeader from '@/components/form/builder/BuilderHeader';
import { useBuilderStore } from '@/lib/store/useBuilderStore';
import { saveLayout } from '@/lib/api/plantillas';

export default function CrearPlantillaPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const { toFormLayout, clearDirty } = useBuilderStore();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const layout = toFormLayout();
      // Por ahora simular guardado - necesitarías el ID real de la plantilla
      console.log('Layout a guardar:', layout);
      
      // await saveLayout(plantillaId, layout);
      clearDirty();
      
      // router.push('/plantillas');
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Crear Plantilla</h1>
      </div>
      
      <BuilderHeader onSave={handleSave} isSaving={isSaving} />
      
      <div className="flex-1 overflow-hidden">
        <Builder />
      </div>
    </div>
  );
}
