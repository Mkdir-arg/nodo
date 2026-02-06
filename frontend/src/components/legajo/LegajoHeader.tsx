'use client';
import { renderTpl } from '@/lib/tpl';

interface Props {
  cfg: any;
  data: any;
  meta: any;
}

export default function LegajoHeader({ cfg, data, meta }: Props) {
  const ctx = { data, meta, ...meta };
  return (
    <div className="p-4 rounded bg-white border border-nodo-border shadow-md">
      {cfg.title && (
        <h1 className="text-2xl font-bold text-nodo-title">
          {renderTpl(cfg.title, ctx)}
        </h1>
      )}
      {cfg.subtitle && (
        <div className="text-sm text-nodo-legajo-subtitle">{cfg.subtitle}</div>
      )}
      {Array.isArray(cfg.chips) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {cfg.chips.map((c: any, i: number) => (
            <span key={i} className="px-2 py-1 bg-slate-100 text-nodo-text rounded text-sm">
              {c.label}: {renderTpl(c.value, ctx)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
