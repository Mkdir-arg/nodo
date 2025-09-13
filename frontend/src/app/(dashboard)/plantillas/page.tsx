'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PlantillasService } from '@/lib/PlantillasService';

export default function PlantillasPage() {
  const { data } = useQuery<any>({ queryKey: ['plantillas'], queryFn: PlantillasService.fetchPlantillas });
  return (
    <div>
      <h1 className="text-2xl mb-4">Plantillas</h1>
      <Link href="/plantillas/crear" className="border px-2 py-1">Crear</Link>
      <ul className="mt-4 space-y-2">
        {data?.results?.map((p:any)=>(
          <li key={p.id} className="border p-2 flex justify-between">
            <span>{p.nombre} v{p.version}</span>
            <Link href={`/plantillas/editar/${p.id}`} className="text-blue-600">Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
