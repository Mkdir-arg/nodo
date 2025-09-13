import { nanoid } from 'nanoid';

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

export function serializeTemplateSchema(nombre: string, sections: any[]) {
  const nodes: any[] = [];

  sections.forEach((sec: any) => {
    const sectionNode = {
      type: 'section' as const,
      id: sec.id,
      title: sec.title || 'Sección',
      collapsed: false,
      children: [] as any[],
    };

    (sec.children || []).forEach((f: any) => {
      const base: any = {
        type: f.type,
        id: f.id,
        key: f.key,
        label: f.label || 'Sin título',
        required: !!f.required,
        helpText: f.helpText,
        seMuestraEnGrilla: !!f.seMuestraEnGrilla,
        esSubsanable: !!f.esSubsanable,
        esEditableOperador: !!f.esEditableOperador,
      };

      if (f.type === 'text' || f.type === 'textarea') {
        base.maxLength = f.maxLength;
        base.pattern = f.pattern;
        base.placeholder = f.placeholder;
      }
      if (f.type === 'number') {
        base.min = f.min;
        base.max = f.max;
        base.step = f.step;
      }
      if (['select', 'multiselect', 'dropdown', 'select_with_filter'].includes(f.type)) {
        base.options = (f.options || []).map((o: any) => ({ value: o.value, label: o.label }));
        base.presentation = f.presentation;
      }
      if (f.type === 'document') {
        base.accept = f.accept;
        base.maxSizeMB = f.maxSizeMB;
      }
      if (f.type === 'sum') {
        base.sources = f.sources || [];
        base.decimals = f.decimals ?? 0;
      }
      if (f.type === 'info') {
        base.html = f.html || '';
      }
      sectionNode.children.push(clean(base));
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
