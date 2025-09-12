"use client";
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function TemplatesPage() {
  const { data } = useQuery({ queryKey: ['templates'], queryFn: () => api.get('/templates/').then(res => res.data) });
  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Plantillas</h1>
      <Link href="/plantillas/nueva" className="text-blue-600">Nueva plantilla</Link>
      <ul className="mt-4 space-y-2">
        {data?.map((t: any) => (
          <li key={t.id} className="border p-2 rounded">
            {t.name} v{t.version}
            <Link href={`/plantillas/${t.id}/editar`} className="ml-2 text-sm text-blue-600">Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
