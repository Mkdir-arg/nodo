'use client';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import FieldCard from './FieldCard';

export default function Canvas() {
  const { sections, selected, setSelected } = useBuilderStore();

  if (!sections?.length) {
    return <div className="text-sm opacity-70">Arrastrá componentes o usá el menú para crear campos.</div>;
  }

  return (
    <div className="space-y-6">
      {sections.map((sec:any) => (
        <section key={sec.id} className="rounded-2xl border p-3 bg-white/50">
          <header
            className={`flex items-center justify-between rounded-xl px-3 py-2 mb-3 ${selected?.id===sec.id ? 'ring-2 ring-sky-300' : ''}`}
            onClick={()=>setSelected({type:'section', id:sec.id})}
          >
            <h3 className="font-semibold">{sec.title || 'Sección'}</h3>
            <div className="text-xs opacity-60">{(sec.children||[]).length} campos</div>
          </header>

          <div className="space-y-2">
            {(sec.children || []).map((node:any) => (
              <FieldCard key={node.id} node={node} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
