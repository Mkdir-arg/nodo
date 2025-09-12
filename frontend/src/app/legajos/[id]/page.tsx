"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { repo } from "@/lib/legajos/repo";
import DynamicForm from "@/lib/legajos/renderer/Renderer";
import { useClientGuard } from "@/lib/useClientGuard";

export default function LegajoDetail() {
  useClientGuard();
  const { id } = useParams<{id:string}>();
  const [d,setD] = useState<any>(null);
  const [t,setT] = useState<any>(null);

  useEffect(()=>{ (async()=>{
    const dossier = await repo.getDossier(id); setD(dossier);
    if (dossier) setT(await repo.getTemplate(dossier.templateId));
  })(); },[id]);

  if (!d || !t) return <main className="p-6 text-white">Cargando…</main>;

  return (
    <main className="p-6 text-white">
      <h1 className="text-xl font-semibold mb-3">Legajo · {t.name}</h1>
      <DynamicForm template={t} defaultValues={d.data} onSubmit={async (v)=>{
        await repo.saveDossier({ ...d, data: v }); alert("Guardado");
      }}/>
    </main>
  );
}
