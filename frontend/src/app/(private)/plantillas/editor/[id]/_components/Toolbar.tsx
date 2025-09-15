function formatUpdatedAt(value: string) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

interface ToolbarProps {
  plantillaId: string;
  layoutVersion: number;
  updatedAt: string;
}

export default function Toolbar({ plantillaId, layoutVersion, updatedAt }: ToolbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Editor de plantilla
        </p>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Plantilla #{plantillaId}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Versión actual del layout: <span className="font-medium text-slate-700 dark:text-slate-200">{layoutVersion}</span>
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Última actualización: <span className="font-medium text-slate-700 dark:text-slate-200">{formatUpdatedAt(updatedAt)}</span>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center justify-center rounded-lg border border-slate-300 bg-slate-100/60 px-3 py-1 text-xs font-medium text-slate-500 transition dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400"
          title="La opción de guardar estará disponible próximamente"
        >
          Guardar cambios
        </button>
      </div>
    </header>
  );
}
