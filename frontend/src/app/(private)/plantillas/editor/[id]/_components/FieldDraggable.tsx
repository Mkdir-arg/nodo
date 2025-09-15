import type { ReactNode } from "react";

interface FieldDraggableProps {
  label: string;
  description?: string;
  icon?: ReactNode;
}

export default function FieldDraggable({ label, description, icon }: FieldDraggableProps) {
  return (
    <div className="group flex cursor-grab flex-col gap-1 rounded-lg border border-dashed border-slate-300 bg-white/80 p-3 text-left text-sm text-slate-600 transition hover:border-slate-400 hover:bg-white dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900">
      <div className="flex items-center gap-2">
        {icon ? <span className="text-slate-400 dark:text-slate-500">{icon}</span> : null}
        <span className="font-medium text-slate-700 dark:text-slate-100">{label}</span>
      </div>
      {description ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span>
      ) : null}
      <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Arrastrar y soltar
      </span>
    </div>
  );
}
