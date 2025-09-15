'use client';
import { renderTpl } from '@/lib/tpl';

interface Props {
  cfg: any;
  data: any;
  meta: any;
}

export default function CounterGrid({ cfg, data, meta }: Props) {
  const cols =
    cfg.layout === 'grid-4'
      ? 'grid-cols-4'
      : cfg.layout === 'grid-3'
      ? 'grid-cols-3'
      : 'grid-cols-2';
  const ctx = { data, meta, ...meta };
  return (
    <div className={`grid ${cols} gap-4`}>
      {(cfg.items || []).map((it: any) => (
        <div key={it.id} className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">{it.label}</div>
          <div className="text-xl font-semibold">
            {renderTpl(it.value, ctx)}
          </div>
          {it.trend && (
            <div className="text-xs text-gray-400">{renderTpl(it.trend, ctx)}</div>
          )}
        </div>
      ))}
    </div>
  );
}
