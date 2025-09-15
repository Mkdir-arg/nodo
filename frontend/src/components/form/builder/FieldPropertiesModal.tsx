'use client';
import { useEffect, useMemo, useState } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';

type Props = { open: boolean; fieldId: string | null; onClose: () => void };

export default function FieldPropertiesModal({ open, fieldId, onClose }: Props) {
  const { sections, updateNode, collectKeysByType } = useBuilderStore();

  // localizar el nodo por id (incluye hijos de group)
  const node = useMemo(() => {
    if (!fieldId) return null;
    for (const s of sections) {
      const list = s.nodes || s.children || [];
      const direct = list.find((n: any) => n.id === fieldId);
      if (direct) return direct;
      const grp = list.find(
        (n: any) => n.type === 'group' && (n.children || []).some((c: any) => c.id === fieldId)
      );
      if (grp) return (grp.children || []).find((c: any) => c.id === fieldId);
    }
    return null;
  }, [fieldId, sections]);

  // borrador editable y cierre con ESC
  const [draft, setDraft] = useState<any>(null);
  useEffect(() => { setDraft(node ? JSON.parse(JSON.stringify(node)) : null); }, [node, open]);
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open || !draft) return null;

  const numKeys = collectKeysByType('number');
  const Row = ({ label, children }: { label: string; children: any }) => (
    <label className="text-sm grid grid-cols-[9rem_1fr] items-center gap-3">
      <span className="opacity-70">{label}</span>
      <div>{children}</div>
    </label>
  );

  const save = () => { updateNode(draft.id, draft); onClose(); };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[min(820px,92vw)] bg-white rounded-2xl shadow-xl p-5 space-y-4 dark:bg-slate-800 dark:border dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Propiedades — {String(draft.type).toUpperCase()}</h3>
          <button className="px-3 py-1 border rounded-lg dark:border-slate-700" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-3 max-h-[65vh] overflow-auto pr-1">
          {draft.kind === 'ui' ? (
            <UiInspector node={draft} onChange={(patch:any)=>setDraft((d:any)=>({...d, ...patch}))} />
          ) : (
            <>
              {/* Comunes */}
              <Row label="Etiqueta">
                <input className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={draft.label || ''}
                       onChange={(e) => setDraft((d: any) => ({ ...d, label: e.target.value }))} />
              </Row>
              <Row label="Key">
                <input className="w-full border rounded p-2 font-mono dark:bg-slate-900 dark:border-slate-700" value={draft.key || ''}
                       onChange={(e) => setDraft((d: any) => ({ ...d, key: e.target.value }))} />
              </Row>
              <Row label="Obligatorio">
                <input type="checkbox" checked={!!draft.required}
                       onChange={(e) => setDraft((d: any) => ({ ...d, required: e.target.checked }))} />
              </Row>
              <Row label="Subsanable">
                <input type="checkbox" checked={!!draft.esSubsanable}
                       onChange={(e) => setDraft((d: any) => ({ ...d, esSubsanable: e.target.checked }))} />
              </Row>
              <Row label="Editable operador">
                <input type="checkbox" checked={!!draft.esEditableOperador}
                       onChange={(e) => setDraft((d: any) => ({ ...d, esEditableOperador: e.target.checked }))} />
              </Row>
              <Row label="En grilla">
                <input type="checkbox" checked={!!draft.seMuestraEnGrilla}
                       onChange={(e) => setDraft((d: any) => ({ ...d, seMuestraEnGrilla: e.target.checked }))} />
              </Row>

              {/* Específicas por tipo */}
              {(draft.type === 'text' || draft.type === 'textarea') && (
                <>
                  <Row label="Placeholder">
                    <input className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={draft.placeholder || ''}
                           onChange={(e) => setDraft((d: any) => ({ ...d, placeholder: e.target.value }))} />
                  </Row>
                  <Row label="Máx. largo">
                    <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={draft.maxLength ?? ''}
                           onChange={(e) => setDraft((d: any) => ({ ...d, maxLength: e.target.value === '' ? undefined : Number(e.target.value) }))} />
                  </Row>
                  <Row label="Regex">
                    <input className="w-full border rounded p-2 font-mono dark:bg-slate-900 dark:border-slate-700" value={draft.pattern || ''}
                           onChange={(e) => setDraft((d: any) => ({ ...d, pattern: e.target.value }))} />
                  </Row>
                </>
              )}

              {draft.type === 'number' && (
                <>
                  <Row label="Mínimo">
                    <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={draft.min ?? ''}
                           onChange={(e) => setDraft((d: any) => ({ ...d, min: e.target.value === '' ? undefined : Number(e.target.value) }))} />
                  </Row>
                  <Row label="Máximo">
                    <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={draft.max ?? ''}
                           onChange={(e) => setDraft((d: any) => ({ ...d, max: e.target.value === '' ? undefined : Number(e.target.value) }))} />
                  </Row>
                    <Row label="Step">
                    <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={draft.step ?? ''}
                           onChange={(e) => setDraft((d: any) => ({ ...d, step: e.target.value === '' ? undefined : Number(e.target.value) }))} />
                  </Row>
                </>
              )}

              {['select', 'dropdown', 'multiselect', 'select_with_filter'].includes(draft.type) && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Opciones</div>
                  {(draft.options || []).map((o: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input className="border rounded p-2 flex-1" value={o.label}
                             onChange={(e) => {
                               const options = [...(draft.options || [])];
                               options[i] = { ...o, label: e.target.value };
                               setDraft((d: any) => ({ ...d, options }));
                             }} />
                      <input className="border rounded p-2 w-40 font-mono" value={o.value}
                             onChange={(e) => {
                               const options = [...(draft.options || [])];
                               options[i] = { ...o, value: e.target.value };
                               setDraft((d: any) => ({ ...d, options }));
                             }} />
                      <button className="px-2 border rounded" onClick={() => {
                        const options = [...(draft.options || [])];
                        options.splice(i, 1);
                        setDraft((d: any) => ({ ...d, options }));
                      }}>−</button>
                    </div>
                  ))}
                  <button className="px-2 py-1 border rounded"
                          onClick={() => setDraft((d: any) => ({
                            ...d,
                            options: [...(d.options || []), { label: 'Opción', value: `op_${(d.options?.length || 0) + 1}` }]
                          }))}>
                    + Agregar opción
                  </button>
                </div>
              )}

              {draft.type === 'document' && (
                <>
                  <Row label="Extensiones">
                    <input className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" placeholder=".pdf,.jpg"
                           value={(draft.accept || []).join(',')}
                           onChange={(e) => setDraft((d: any) => ({
                             ...d,
                             accept: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                           }))} />
                  </Row>
                  <Row label="Tamaño MB">
                    <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={draft.maxSizeMB ?? ''}
                           onChange={(e) => setDraft((d: any) => ({
                             ...d, maxSizeMB: e.target.value === '' ? undefined : Number(e.target.value)
                           }))} />
                  </Row>
                </>
              )}

              {draft.type === 'sum' && (
                <>
                  <Row label="Decimales">
                    <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={draft.decimals ?? 0}
                           onChange={(e) => setDraft((d: any) => ({ ...d, decimals: Number(e.target.value) || 0 }))} />
                  </Row>
                  <div>
                    <div className="text-sm opacity-70 mb-1">Fuentes (solo números)</div>
                    <div className="flex flex-wrap gap-2">
                      {numKeys.map((k) => {
                        const active = (draft.sources || []).includes(k);
                        return (
                          <button
                            key={k}
                            type="button"
                            className={`px-2 py-1 border rounded text-xs ${active ? 'bg-sky-100 border-sky-300' : ''}`}
                            onClick={() => {
                              const set = new Set(draft.sources || []);
                              if (active) set.delete(k); else set.add(k);
                              setDraft((d: any) => ({ ...d, sources: Array.from(set) }));
                            }}
                          >
                            {k}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {draft.type === 'date' && (
                <>
                  <Row label="Default relativo">
                    <input
                      className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700"
                      placeholder="e.g. +0 days"
                      value={draft.defaultRelative || ''}
                      onChange={(e) => setDraft((d: any) => ({ ...d, defaultRelative: e.target.value }))}
                    />
                  </Row>
                </>
              )}

              {draft.type === 'info' && (
                <Row label="HTML">
                  <textarea className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" rows={3} value={draft.html || ''}
                            onChange={(e) => setDraft((d: any) => ({ ...d, html: e.target.value }))} />
                </Row>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 border rounded-lg" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 rounded-lg bg-sky-600 text-white" onClick={save}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function UiInspector({ node, onChange }: any) {
  const cfg = node.config || {};
  if (node.type === 'ui:header') {
    return (
      <div className="space-y-3">
        <label className="block text-sm">Variante
          <select
            className="border rounded-md h-10 px-2 w-full"
            value={cfg.variant ?? 'card'}
            onChange={(e)=>onChange({ config: { ...cfg, variant: e.target.value } })}
          >
            <option value="hero">hero</option>
            <option value="card">card</option>
            <option value="compact">compact</option>
          </select>
        </label>
        <label className="block text-sm">Título (plantilla)
          <input className="border rounded-md h-10 px-2 w-full"
            value={cfg.title ?? ''}
            onChange={(e)=>onChange({ config: { ...cfg, title: e.target.value } })}
            placeholder='{{ data.ciudadano.apellido }}, {{ data.ciudadano.nombre }}'
          />
        </label>
        <label className="block text-sm">Subtítulo
          <input className="border rounded-md h-10 px-2 w-full"
            value={cfg.subtitle ?? ''}
            onChange={(e)=>onChange({ config: { ...cfg, subtitle: e.target.value } })}
          />
        </label>
      </div>
    );
  }

  if (node.type === 'ui:kpi-grid') {
    const items = cfg.items ?? [];
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">KPIs</span>
          <button type="button" className="h-8 px-2 border rounded"
            onClick={()=>onChange({ config: { ...cfg, items: [...items, { id: crypto.randomUUID(), label:'Nuevo KPI', value:'{{ meta.counts.intervenciones }}' }] } })}
          >Agregar</button>
        </div>
        {items.map((it:any, i:number)=>(
          <div key={it.id} className="grid gap-2" style={{gridTemplateColumns:"1fr 1fr auto"}}>
            <input className="border rounded h-9 px-2" value={it.label}
              onChange={(e)=>{
                const copy=[...items]; copy[i]={...it, label:e.target.value};
                onChange({ config: { ...cfg, items: copy } });
              }}/>
            <input className="border rounded h-9 px-2" value={it.value}
              onChange={(e)=>{
                const copy=[...items]; copy[i]={...it, value:e.target.value};
                onChange({ config: { ...cfg, items: copy } });
              }}/>
            <button type="button" className="h-9 px-2 border rounded"
              onClick={()=>{
                const copy=items.filter((_:any,idx:number)=>idx!==i);
                onChange({ config: { ...cfg, items: copy } });
              }}>Eliminar</button>
          </div>
        ))}
      </div>
    );
  }

  return <div className="text-sm text-slate-500">Seleccioná un bloque de estética para configurarlo.</div>;
}
