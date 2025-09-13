"use client";
export default function FloatingToolbar({ onPlus }:{ onPlus:()=>void }) {
  return (
    <div className="flex flex-col gap-2 p-2 rounded-2xl shadow bg-white/90 border sticky top-28 dark:bg-slate-800/90 dark:border-slate-700">
      <button type="button" aria-haspopup="dialog" aria-label="Agregar componente"
        onClick={onPlus}
        className="w-10 h-10 grid place-items-center rounded-xl bg-sky-100 border dark:bg-sky-800 dark:border-sky-600 dark:text-white">
        +
      </button>
    </div>
  );
}
