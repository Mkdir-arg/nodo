"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { repo } from "@/lib/legajos/repo";
import DynamicForm from "@/lib/legajos/renderer/Renderer";
import { useClientGuard } from "@/lib/useClientGuard";

export default function NuevoLegajo() {
  useClientGuard();
  const sp = useSearchParams(); const r = useRouter();
  const [template,setTemplate] = useState<any>(null);

  useEffect(()=>{ (async()=>{
    const id = sp.get("plantilla");
    if (!id) return;
    const t = await repo.getTemplate(id);
    setTemplate(t ?? null);
  })(); },[sp]);

  if (!template) return <main className="p-6 text-white">Cargando plantilla…</main>;

  return (
    <main className="p-6 text-white">
      <h1 className="text-xl font-semibold mb-3">Nuevo legajo · {template.name}</h1>
      <DynamicForm template={template} onSubmit={async (v)=>{
        const d = await repo.createDossier({ templateId: template.id, templateVersion: template.version, data: v, status:"active" });
        r.replace(`/legajos/${d.id}`);
      }}/>
    </main>
  );
}
