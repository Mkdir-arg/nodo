'use client';
import { useVisualConfigStore } from '@/lib/store/usePlantillaVisualStore';

export default function EditorCounters() {
  const { visualConfig, setVisualConfig } = useVisualConfigStore();
  const items = visualConfig.counters?.items || [];

  const updateItem = (idx: number, patch: any) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    setVisualConfig({
      ...visualConfig,
      counters: { ...(visualConfig.counters || {}), items: next },
    });
  };

  const add = () => {
    setVisualConfig({
      ...visualConfig,
      counters: {
        ...(visualConfig.counters || {}),
        items: [...items, { id: `c${items.length}`, label: '' }],
      },
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Contadores</h3>
      {items.map((it: any, idx: number) => (
        <div key={idx} className="flex gap-2">
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Etiqueta"
            value={it.label || ''}
            onChange={(e) => updateItem(idx, { label: e.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="px-2 py-1 border rounded"
      >
        Agregar
      </button>
    </div>
  );
}
