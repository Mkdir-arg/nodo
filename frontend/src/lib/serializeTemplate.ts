import { nanoid } from 'nanoid';
import { defLayout } from '@/lib/form-builder/factory';

const isUiNode = (node: any) => node?.kind === 'ui' || String(node?.type || '').startsWith('ui:');

function clean<T extends Record<string, any>>(obj: T): T {
  const out: any = Array.isArray(obj) ? [] : {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) out[k] = v.map((x) => (x && typeof x === 'object' ? clean(x) : x));
    else if (typeof v === 'object') out[k] = clean(v as any);
    else out[k] = v;
  });
  return out as T;
}

function ensureNode(node: any) {
  const copy = JSON.parse(JSON.stringify(node ?? {}));
  const id = copy.id ?? `fld_${nanoid(6)}`;
  copy.id = id;
  const layoutDefaults = defLayout(copy.type ?? '');
  const layout = copy.layout ?? {};
  copy.layout = {
    i: layout.i ?? id,
    x: typeof layout.x === 'number' ? layout.x : 0,
    y: typeof layout.y === 'number' ? layout.y : 0,
    w: layout.w ?? layoutDefaults.w,
    h: layout.h ?? layoutDefaults.h,
  };
  copy.kind = isUiNode(copy) ? 'ui' : 'field';
  if (Array.isArray(copy.children)) {
    copy.children = copy.children.map((child: any) => ensureNode(child));
  }
  return clean(copy);
}

export function serializeTemplateSchema(nombre: string, sections: any[]) {
  const nodes: any[] = [];

  (sections || []).forEach((sec: any) => {
    const normalizedNodes = (sec?.nodes || sec?.children || []).map((n: any) => ensureNode(n));
    const sectionNode = clean({
      type: 'section' as const,
      id: sec?.id,
      title: sec?.title || 'Sección',
      collapsed: false,
      layout_mode: sec?.layout_mode === 'grid' ? 'grid' : 'flow',
      nodes: normalizedNodes,
      children: normalizedNodes,
    });
    nodes.push(sectionNode);
  });

  const schema = {
    id: `tpl_${nanoid(8)}`,
    name: nombre,
    version: 1,
    nodes,
  };

  return clean(schema);
}
