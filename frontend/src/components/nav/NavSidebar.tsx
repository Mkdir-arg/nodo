'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useNavStore } from '@/lib/store/useNavStore';

export default function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { legajosExpanded, setLegajosExpanded, plantillas, refreshPlantillas } = useNavStore();

  useEffect(() => { refreshPlantillas(); }, [refreshPlantillas]);

  return (
    <aside className="w-64 p-3 space-y-2">
      {/* ... otros items (Dashboard, etc.) ... */}

      {/* Item Legajos con caret */}
      <div className="space-y-1">
        <button
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 border"
          onClick={() => setLegajosExpanded(!legajosExpanded)}
        >
          <span className="flex items-center gap-2">📊 <span>Legajos</span></span>
          <span className={`transition-transform ${legajosExpanded ? 'rotate-90' : ''}`}>›</span>
        </button>

        {legajosExpanded && (
          <div className="ml-4 pl-2 border-l space-y-1">
            {plantillas.length === 0 && (
              <div className="text-xs opacity-60 px-2 py-1">Sin plantillas</div>
            )}
            {plantillas.map((p) => (
              <div key={p.id} className="flex items-center justify-between group">
                <Link
                  href={`/legajos?plantillaId=${p.id}`}
                  className={`px-2 py-1 rounded hover:bg-gray-100 text-sm ${pathname?.startsWith('/legajos') ? 'font-medium' : ''}`}
                >
                  {p.nombre}
                </Link>
                <button
                  title="Crear legajo"
                  onClick={() => router.push(`/legajos/nuevo?plantillaId=${p.id}`)}
                  className="opacity-60 group-hover:opacity-100 text-sm px-2"
                >＋</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Plantillas (catálogo) */}
      <Link href="/plantillas" className={`block px-3 py-2 rounded-xl hover:bg-gray-100 border ${pathname==='/plantillas'?'bg-gray-50':''}`}>📄 Plantillas</Link>
    </aside>
  );
}
