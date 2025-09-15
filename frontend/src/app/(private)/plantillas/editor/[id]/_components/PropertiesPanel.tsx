export default function PropertiesPanel() {
  return (
    <aside className="flex h-full min-h-0 flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Propiedades</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Seleccioná un elemento en el lienzo para editar sus propiedades.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/60 p-4 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
        Todavía no hay ningún elemento seleccionado.
      </div>
    </aside>
  );
}
