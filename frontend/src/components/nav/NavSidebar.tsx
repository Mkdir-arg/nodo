'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useNavStore } from '@/lib/store/useNavStore';

export default function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { legajosExpanded, setLegajosExpanded, configExpanded, setConfigExpanded, plantillas, refreshPlantillas } = useNavStore();

  useEffect(() => { refreshPlantillas(); }, [refreshPlantillas]);

  return (
    <aside className="w-64 p-3 space-y-2 bg-background border-r border-border">
      {/* Dashboard */}
      <Link href="/dashboard" className={`block px-3 py-2 rounded-xl hover:bg-muted border border-border text-foreground ${pathname==='/dashboard'?'bg-muted':''}`}>🏠 Dashboard</Link>

      {/* Item Legajos con caret */}
      <div className="space-y-1">
        <button
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted border border-border text-foreground"
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
                  href={`/legajos?formId=${p.id}`}
                  className={`px-2 py-1 rounded hover:bg-muted text-sm text-foreground ${pathname?.startsWith('/legajos') ? 'font-medium' : ''}`}
                >
                  {p.nombre}
                </Link>
                <button
                  title="Crear legajo"
                  onClick={() => router.push(`/legajos/nuevo?formId=${p.id}`)}
                  className="opacity-60 group-hover:opacity-100 text-sm px-2"
                >＋</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Configuraciones con submenú */}
      <div className="space-y-1">
        <button
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted border border-border text-foreground"
          onClick={() => setConfigExpanded(!configExpanded)}
        >
          <span className="flex items-center gap-2">⚙️ <span>Configuraciones</span></span>
          <span className={`transition-transform ${configExpanded ? 'rotate-90' : ''}`}>›</span>
        </button>

        {configExpanded && (
          <div className="ml-4 pl-2 border-l space-y-1">
            <Link
              href="/plantillas"
              className={`block px-2 py-1 rounded hover:bg-muted text-sm text-foreground ${pathname==='/plantillas'?'font-medium':''}`}
            >
              📄 Plantillas
            </Link>
            <Link
              href="/flujos"
              className={`block px-2 py-1 rounded hover:bg-muted text-sm text-foreground ${pathname==='/flujos'?'font-medium':''}`}
            >
              🔄 Flujos
            </Link>
            <Link
              href="/configuraciones"
              className={`block px-2 py-1 rounded hover:bg-muted text-sm text-foreground ${pathname==='/configuraciones'?'font-medium':''}`}
            >
              🛠️ Sistema
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
