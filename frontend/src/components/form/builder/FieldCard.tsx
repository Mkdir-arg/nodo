'use client';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';

function MiniPreview({ node }: { node: any }) {
  const label = node.label || 'Sin título';
  switch (node.type) {
    case 'text':
    case 'textarea':
      return (
        <>
          <div className="font-medium">{label}</div>
          <input
            className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700"
            placeholder={node.placeholder || ''}
            readOnly
          />
        </>
      );
    case 'number':
      return (
        <>
          <div className="font-medium">{label}</div>
          <input
            type="number"
            className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700"
            readOnly
          />
        </>
      );
    case 'date':
      return (
        <>
          <div className="font-medium">{label}</div>
          <input
            type="date"
            className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700"
            readOnly
          />
        </>
      );
    case 'select':
    case 'dropdown':
    case 'select_with_filter':
      return (
        <>
          <div className="font-medium">{label}</div>
          <select
            className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700"
            disabled
          >
            <option>{node.placeholder || 'Seleccione...'}</option>
            {(node.options || []).map((o: any) => (
              <option key={o.value}>{o.label}</option>
            ))}
          </select>
        </>
      );
    case 'multiselect':
      return (
        <>
          <div className="font-medium">{label}</div>
          <div className="flex flex-wrap gap-2">
            {(node.options || []).slice(0, 3).map((o: any) => (
              <span
                key={o.value}
                className="px-2 py-1 rounded border text-xs dark:border-slate-700"
              >
                {o.label}
              </span>
            ))}
          </div>
        </>
      );
    case 'document':
      return (
        <>
          <div className="font-medium">{label}</div>
          <input
            type="file"
            className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700"
            disabled
          />
          <p className="text-xs opacity-60">
            Ext: {(node.accept || []).join(', ')} • Max {node.maxSizeMB || '—'}MB
          </p>
        </>
      );
    case 'sum':
      return (
        <>
          <div className="font-medium">{label}</div>
          <input
            className="w-full border rounded p-2 bg-gray-50 dark:bg-slate-700 dark:border-slate-700"
            value="(auto)"
            readOnly
          />
        </>
      );
    case 'phone':
      return (
        <>
          <div className="font-medium">{label}</div>
          <input
            type="tel"
            className="w-full border rounded p-2 dark:bg-slate-900 dark:border-slate-700"
            readOnly
          />
        </>
      );
    case 'cuit_razon_social':
      return (
        <>
          <div className="font-medium">{label}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              placeholder="CUIT"
              className="border rounded p-2 dark:bg-slate-900 dark:border-slate-700"
              readOnly
            />
            <input
              placeholder="Razón social"
              className="border rounded p-2 dark:bg-slate-900 dark:border-slate-700"
              readOnly
            />
          </div>
        </>
      );
    case 'info':
      return <div className="font-medium">{node.label || 'Texto informativo'}</div>;
    case 'group':
      return (
        <>
          <div className="font-medium">{node.label || 'Grupo'}</div>
          <div className="rounded border p-2 text-xs opacity-70 dark:border-slate-700">
            Contiene {(node.children || []).length} subcampos
          </div>
        </>
      );
    default:
      return <div className="font-medium">{label}</div>;
  }
}

type DragHandle = { attributes: any; listeners: any };
export default function FieldCard({
  node,
  dragHandle,
  readonly,
}: {
  node: any;
  dragHandle?: DragHandle;
  readonly?: boolean;
}) {
  const { selected, setSelected, duplicateNode, removeNode } = useBuilderStore();
  const isSel = selected?.type === 'field' && selected?.id === node.id;

  return (
    <div
      className={`rounded-xl border bg-white p-3 space-y-2 dark:bg-slate-800 dark:border-slate-700 ${
        readonly ? 'pointer-events-none' : 'cursor-pointer'
      } ${isSel ? 'ring-2 ring-sky-300' : 'hover:bg-gray-50 dark:hover:bg-slate-700'}`}
      onClick={() => !readonly && setSelected({ type: 'field', id: node.id })}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dragHandle && (
            <button
              type="button"
              aria-label="Arrastrar campo"
              className="px-2 py-1 border rounded text-xs cursor-grab dark:border-slate-700 dark:text-slate-200"
              {...dragHandle.attributes}
              {...dragHandle.listeners}
              onMouseDownCapture={(e) => e.stopPropagation()}
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              ⠿
            </button>
          )}
          <span className="text-xs uppercase opacity-60">{node.type}</span>
        </div>
        {!readonly && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(
                  new CustomEvent('builder:open-props', { detail: { id: node.id } }),
                );
              }}
              className="text-xs px-2 py-1 border rounded dark:border-slate-700"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                duplicateNode(node.id);
              }}
              className="text-xs px-2 py-1 border rounded dark:border-slate-700"
            >
              Duplicar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeNode(node.id);
              }}
              className="text-xs px-2 py-1 border rounded dark:border-slate-700 text-red-600"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
      <MiniPreview node={node} />
    </div>
  );
}
