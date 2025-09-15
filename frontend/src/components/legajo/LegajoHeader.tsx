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
    <div className="p-4 rounded bg-white shadow">
      {cfg.title && (
        <h1 className="text-2xl font-semibold">
          {renderTpl(cfg.title, ctx)}
        </h1>
      )}
      {cfg.subtitle && (
        <div className="text-sm text-gray-500">{cfg.subtitle}</div>
      )}
      {Array.isArray(cfg.chips) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {cfg.chips.map((c: any, i: number) => (
            <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
              {c.label}: {renderTpl(c.value, ctx)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
