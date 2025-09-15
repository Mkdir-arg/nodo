'use client';
import { useVisualConfigStore } from '@/lib/store/usePlantillaVisualStore';

export default function EditorHeader() {
  const { visualConfig, setVisualConfig } = useVisualConfigStore();
  const cfg = visualConfig.header || {};
  return (
    <div className="space-y-2">
      <h3 className="font-medium">Encabezado</h3>
      <div>
        <label className="block text-sm">Título</label>
        <input
          className="border rounded px-2 py-1 w-full"
          value={cfg.title || ''}
          onChange={(e) =>
            setVisualConfig({ ...visualConfig, header: { ...cfg, title: e.target.value } })
          }
        />
      </div>
    </div>
  );
}
