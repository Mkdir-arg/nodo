import { useFormContext } from "react-hook-form";
import { CheckSquare } from 'lucide-react';

export default function CheckboxField({ field }: { field: any }) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[field.key]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={field.key}
        className={`
          group flex items-center gap-4 p-5 rounded-2xl cursor-pointer
          bg-white/90 dark:bg-slate-900/70
          backdrop-blur-xl
          border border-slate-200/60 dark:border-slate-700/60
          shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50
          hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-800/50
          hover:scale-[1.02]
          transition-all duration-300
          ${error ? 'ring-2 ring-red-500/50 border-red-500/50' : ''}
        `}
      >
        <input
          type="checkbox"
          id={field.key}
          {...register(field.key)}
          className="
            w-6 h-6 rounded-xl
            text-blue-600 dark:text-blue-500
            focus:ring-2 focus:ring-blue-500/50
            border-2 border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800
            shadow-inner
            transition-all duration-200
          "
        />
        <div className="flex-1">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {field.label}
            {field.required && <span className="text-red-500 ml-1.5">*</span>}
          </span>
          {field.help && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{field.help}</p>
          )}
        </div>
        <CheckSquare size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
      </label>
      {error && (
        <div className="
          flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-red-50/80 dark:bg-red-900/20
          border border-red-200/50 dark:border-red-700/50
        ">
          <span className="text-red-500">⚠</span>
          <p className="text-xs text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}