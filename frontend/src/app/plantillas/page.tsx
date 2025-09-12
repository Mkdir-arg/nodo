"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { repo } from "@/lib/legajos/repo";
import { Template } from "@/lib/legajos/schema";
import { nanoid } from "nanoid";
import { legajoCiudadano } from "@/lib/legajos/seeds";
import { useClientGuard } from "@/lib/useClientGuard";

export default function PlantillasList() {
  useClientGuard();
  const [items,setItems] = useState<Template[]>([]);
  useEffect(()=>{ (async()=>{
    const list = await repo.listTemplates();
    if (list.length===0) {
      await repo.upsertTemplate(legajoCiudadano);
      setItems([legajoCiudadano]);
    } else setItems(list);
  })(); },[]);
  const create = async () => {
    const t: Template = {
      id: nanoid(), name:"Legajo nuevo", slug:"legajo-nuevo",
      version:"0.1.0", status:"draft", fields:[],
      layout:[{type:"row", children:[{type:"col", span:12, children:[]}]}]
    };
    await repo.upsertTemplate(t);
    location.href = `/plantillas/${t.id}/builder`;
  };
  return (
    <main className="p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Plantillas</h1>
        <button onClick={create} className="px-3 py-1 rounded-lg bg-blue-600">Nueva plantilla</button>
      </div>
      <ul className="space-y-2">
        {items.map(t=>(
          <li key={t.id} className="border border-gray-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-gray-400">{t.slug} · {t.status} · v{t.version}</div>
            </div>
            <div className="flex gap-2">
              <Link href={`/plantillas/${t.id}/builder`} className="px-3 py-1 rounded-lg bg-gray-800">Editar</Link>
              <Link href={`/legajos/nuevo?plantilla=${t.id}`} className="px-3 py-1 rounded-lg bg-emerald-700">Usar</Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
