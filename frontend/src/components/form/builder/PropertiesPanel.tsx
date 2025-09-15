'use client';
import { useEffect, useMemo } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';

function Row({label, children}:{label:string; children:any}) {
  return (
    <label className="text-sm grid grid-cols-[8rem_1fr] items-center gap-2">
      <span className="opacity-70">{label}</span>
      <div>{children}</div>
    </label>
  );
}

export default function PropertiesPanel() {
  const { selected, sections, updateNode, collectKeysByType } = useBuilderStore();
  const node = useMemo(()=>{
    if (!selected || selected.type!=='field') return null;
    for (const s of sections) {
      const list = s.nodes || s.children || [];
      const hit = list.find((n:any)=>n.id===selected.id);
      if (hit) return hit;
      const g = list.find((n:any)=>n.type==='group' && (n.children||[]).some((c:any)=>c.id===selected.id));
      if (g) return (g.children||[]).find((c:any)=>c.id===selected.id);
    }
    return null;
  }, [selected, sections]);

  useEffect(()=>{/* no-op: podrías sincronizar validaciones */}, [node]);

  if (!node) return (
    <aside className="mt-4 lg:mt-0 lg:w-80">
      <div className="rounded-2xl border p-3 bg-white/60 dark:bg-slate-800/60 dark:border-slate-700">
        <div className="text-sm opacity-70">Seleccioná un campo para editar sus propiedades.</div>
      </div>
    </aside>
  );

  const numKeys = collectKeysByType('number');

  return (
    <aside className="mt-4 lg:mt-0 lg:w-80 space-y-3">
      <div className="rounded-2xl border p-3 bg-white/60 space-y-2 dark:bg-slate-800/60 dark:border-slate-700">
        <h4 className="font-semibold">Propiedades</h4>

        <Row label="Etiqueta">
          <input className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={node.label||''}
                 onChange={e=>updateNode(node.id, { label: e.target.value })}/>
        </Row>
        <Row label="Key">
          <input className="w-full border rounded p-2 font-mono dark:bg-slate-900 dark:border-slate-700" value={node.key||''}
                 onChange={e=>updateNode(node.id, { key: e.target.value })}/>
        </Row>
        <Row label="Obligatorio">
          <input type="checkbox" checked={!!node.required}
                 onChange={e=>updateNode(node.id, { required: e.target.checked })}/>
        </Row>
        <Row label="Subsanable">
          <input type="checkbox" checked={!!node.esSubsanable}
                 onChange={e=>updateNode(node.id, { esSubsanable: e.target.checked })}/>
        </Row>
        <Row label="Editable operador">
          <input type="checkbox" checked={!!node.esEditableOperador}
                 onChange={e=>updateNode(node.id, { esEditableOperador: e.target.checked })}/>
        </Row>
        <Row label="En grilla">
          <input type="checkbox" checked={!!node.seMuestraEnGrilla}
                 onChange={e=>updateNode(node.id, { seMuestraEnGrilla: e.target.checked })}/>
        </Row>

        {(node.type==='text'||node.type==='textarea') && (
          <>
            <Row label="Placeholder">
              <input className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={node.placeholder||''}
                     onChange={e=>updateNode(node.id, { placeholder: e.target.value })}/>
            </Row>
            <Row label="Máx. largo">
              <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={node.maxLength||''}
                     onChange={e=>updateNode(node.id, { maxLength: Number(e.target.value)||undefined })}/>
            </Row>
            <Row label="Regex">
              <input className="w-full border rounded p-2 font-mono dark:bg-slate-900 dark:border-slate-700" value={node.pattern||''}
                     onChange={e=>updateNode(node.id, { pattern: e.target.value })}/>
            </Row>
          </>
        )}

        {node.type==='number' && (
          <>
            <Row label="Mínimo">
              <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={node.min ?? ''} onChange={e=>updateNode(node.id, { min: e.target.value===''?undefined:Number(e.target.value) })}/>
            </Row>
            <Row label="Máximo">
              <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={node.max ?? ''} onChange={e=>updateNode(node.id, { max: e.target.value===''?undefined:Number(e.target.value) })}/>
            </Row>
            <Row label="Step">
              <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={node.step ?? ''} onChange={e=>updateNode(node.id, { step: e.target.value===''?undefined:Number(e.target.value) })}/>
            </Row>
          </>
        )}

        {['select','dropdown','multiselect','select_with_filter'].includes(node.type) && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Opciones</div>
            {(node.options||[]).map((o:any, i:number)=>(
              <div key={i} className="flex gap-2">
                <input className="border rounded p-2 flex-1 dark:bg-slate-900 dark:border-slate-700" value={o.label}
                       onChange={e=>{
                         const options=[...(node.options||[])]; options[i]={...o,label:e.target.value};
                         updateNode(node.id, { options });
                       }}/>
                <input className="border rounded p-2 w-40 font-mono dark:bg-slate-900 dark:border-slate-700" value={o.value}
                       onChange={e=>{
                         const options=[...(node.options||[])]; options[i]={...o,value:e.target.value};
                         updateNode(node.id, { options });
                       }}/>
                <button type="button" className="px-2 border rounded dark:border-slate-700"
                        onClick={()=>{
                          const options=[...(node.options||[])]; options.splice(i,1);
                          updateNode(node.id, { options });
                        }}>−</button>
              </div>
            ))}
            <button type="button" className="px-2 py-1 border rounded dark:border-slate-700"
                    onClick={()=>{
                      const options=[...(node.options||[]), {label:'Opción', value:`op_${(node.options?.length||0)+1}`}];
                      updateNode(node.id, { options });
                    }}>+ Agregar opción</button>
          </div>
        )}

        {node.type==='document' && (
          <>
            <Row label="Extensiones">
              <input className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" placeholder=".pdf,.jpg"
                     value={(node.accept||[]).join(',')}
                     onChange={e=>updateNode(node.id, { accept: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })}/>
            </Row>
            <Row label="Tamaño MB">
              <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={node.maxSizeMB ?? ''} onChange={e=>updateNode(node.id, { maxSizeMB: e.target.value===''?undefined:Number(e.target.value) })}/>
            </Row>
          </>
        )}

        {node.type==='sum' && (
          <>
            <Row label="Decimales">
              <input type="number" className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" value={node.decimals ?? 0}
                     onChange={e=>updateNode(node.id, { decimals: Number(e.target.value)||0 })}/>
            </Row>
            <div>
              <div className="text-sm opacity-70 mb-1">Fuentes (solo números)</div>
              <div className="flex flex-wrap gap-2">
                {numKeys.map(k=>{
                  const active = (node.sources||[]).includes(k);
                  return (
                    <button key={k} type="button"
                      className={`px-2 py-1 border rounded text-xs ${active?'bg-sky-100 border-sky-300 dark:bg-sky-900 dark:border-sky-600':''} dark:border-slate-700`}
                      onClick={()=>{
                        const set = new Set(node.sources||[]);
                        if (active) set.delete(k); else set.add(k);
                        updateNode(node.id, { sources: Array.from(set) });
                      }}>{k}</button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {node.type==='date' && (
          <>
            <Row label="Default relativo">
              <input className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" placeholder='e.g. +0 days'
                     onChange={e=>{/* puedes modelar un selector; dejamos libre */}}/>
            </Row>
          </>
        )}

        {node.type==='info' && (
          <Row label="HTML">
            <textarea className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700" rows={3} value={node.html||''}
                     onChange={e=>updateNode(node.id, { html: e.target.value })}/>
          </Row>
        )}
      </div>
    </aside>
  );
}
