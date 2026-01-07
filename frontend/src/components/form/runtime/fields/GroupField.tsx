import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2, GripVertical } from 'lucide-react';
import DynamicNode from "../DynamicNode";

export default function GroupField({ field }:{field:any}) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: field.key });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {field.label}
        </label>
        <button
          type="button"
          onClick={()=>append({})}
          className="
            flex items-center gap-2 px-3 py-2 rounded-xl
            bg-blue-600 hover:bg-blue-700
            text-white text-sm font-medium
            transition-all duration-200
          "
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>
      
      <div className="space-y-3">
        {fields.map((f, idx) => (
          <div
            key={f.id}
            className="
              p-4 rounded-2xl space-y-3
              bg-white/70 dark:bg-slate-900/60
              backdrop-blur-md
              border border-white/30 dark:border-slate-700/40
              shadow-sm hover:shadow-md
              transition-all duration-200
            "
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <GripVertical size={16} />
                <span>Item {idx + 1}</span>
              </div>
              <button
                type="button"
                onClick={()=>remove(idx)}
                className="
                  p-2 rounded-lg
                  hover:bg-red-100 dark:hover:bg-red-900/30
                  text-red-600 dark:text-red-400
                  transition-colors
                "
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="space-y-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
              {field.children?.map((c:any)=> (
                <DynamicNode key={c.id} node={c} prefix={`${field.key}.${idx}.`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {fields.length === 0 && (
        <div className="
          p-8 rounded-2xl text-center
          bg-slate-50/60 dark:bg-slate-800/40
          border-2 border-dashed border-slate-300/50 dark:border-slate-600/50
        ">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No hay items. Click en "Agregar" para comenzar.
          </p>
        </div>
      )}
    </div>
  );
}
