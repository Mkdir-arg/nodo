import { useFormContext, useWatch } from "react-hook-form";
import { Calculator } from 'lucide-react';

export default function SumField({ field }:{field:any}) {
  const { control } = useFormContext();
  const watchedFields = useWatch({ control, name: field.sources || [] });
  const total = (field.sources || []).reduce((acc: number, key: string, index: number) => {
    const v = parseFloat(watchedFields[index] || 0);
    return acc + (isNaN(v) ? 0 : v);
  }, 0);
  
  return (
    <div className="space-y-2">
      {field.label && (
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <Calculator size={16} className="text-slate-500" />
          {field.label}
        </label>
      )}
      <div className="
        p-4 rounded-2xl
        bg-gradient-to-br from-emerald-50/80 to-teal-50/80
        dark:from-emerald-900/20 dark:to-teal-900/20
        backdrop-blur-md
        border border-emerald-200/50 dark:border-emerald-700/50
        shadow-sm
      ">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total</span>
          <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
