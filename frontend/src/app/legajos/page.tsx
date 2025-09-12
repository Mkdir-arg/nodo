"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { repo } from "@/lib/legajos/repo";
import { Dossier } from "@/lib/legajos/schema";
import { useClientGuard } from "@/lib/useClientGuard";

export default function LegajosList() {
  useClientGuard();
  const [items,setItems] = useState<Dossier[]>([]);
  useEffect(()=>{ repo.listDossiers().then(setItems); },[]);
  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">Legajos</h1>
      <ul className="space-y-2">
        {items.map(d=>(
          <li key={d.id} className="border border-gray-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{d.id}</div>
              <div className="text-xs text-gray-400">{d.templateId} · v{d.templateVersion} · {d.status}</div>
            </div>
            <Link href={`/legajos/${d.id}`} className="px-3 py-1 rounded-lg bg-gray-800">Abrir</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
