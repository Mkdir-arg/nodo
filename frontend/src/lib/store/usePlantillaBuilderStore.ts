'use client';
import { create } from 'zustand';
import { newField, FieldType } from '@/lib/form-builder/factory';
import { arrayMove } from '@dnd-kit/sortable';

export type ValidationError = { code: string; message: string; path?: string[] };

function isSelectType(t: string) {
  return ['select', 'multiselect', 'dropdown', 'select_with_filter'].includes(t);
}

type FieldNode = any;
interface Section { id: string; title?: string; children: FieldNode[]; }
type Selected = { type: 'section' | 'field'; id: string } | null;

interface State {
  sections: Section[];
  selected: Selected;
  dirty: boolean;

  plantillaId?: string | null;
  nombre: string;
  version: number;
  descripcion?: string | null;

  setTemplate: (tpl: any) => void;
  setNombre: (n: string) => void;
  resetDirty: () => void;
  buildSchema: () => any;

  addSection: () => string;
  updateSection: (id: string, patch: Partial<any>) => void;
  duplicateSection: (id: string) => void;
  removeSection: (id: string) => void;
  addField: (sectionId: string, typeOrNode: FieldType | FieldNode) => string | undefined;
  updateNode: (id: string, patch: any) => void;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  moveSection: (activeId: string, overId: string) => void;
  moveField: (activeId: string, overId?: string | null, toSectionId?: string) => void;
  collectKeysByType: (t: string) => string[];
  ensureUniqueKey: (base: string) => string;
  validateAll: () => ValidationError[];
  setSelected: (sel: Selected) => void;
  findSectionIdByField: (fieldId: string) => string | null;
  getSectionIdForInsert: () => string;
  setDirty: (d: boolean) => void;
  _locateNode: (id: string) => any;
}

export const useBuilderStore = create<State>((set, get) => ({
  sections: [],
  selected: null,
  dirty: false,

  plantillaId: null,
  nombre: "",
  version: 1,
  descripcion: null,
  addSection: () => {
    const n = (get().sections?.length || 0) + 1;
    const id = `sec_${crypto.randomUUID().slice(0, 6)}`;
    const section = { type: 'section', id, title: `Sección ${n}`, children: [] as any[] };
    set((s) => ({
      sections: [...(s.sections || []), section],
      selected: { type: 'section', id },
      dirty: true,
    }));
    return id;
  },

  updateSection: (id, patch) => set((state) => {
    const sections = (state.sections || []).map((s: any) =>
      s.id === id ? { ...s, ...patch } : s
    );
    return { ...state, sections, dirty: true };
  }),

  duplicateSection: (id) => set((state) => {
    const idx = (state.sections || []).findIndex((s: any) => s.id === id);
    if (idx < 0) return state;
    const deep = (o: any) => JSON.parse(JSON.stringify(o));
    const clone = deep(state.sections[idx]);
    clone.id = `sec_${crypto.randomUUID().slice(0, 6)}`;
    clone.title = `${clone.title || 'Sección'} (copia)`;
    const ensure = state.ensureUniqueKey;
    clone.children = (clone.children || []).map((n: any) => {
      const c = deep(n);
      c.id = `fld_${crypto.randomUUID().slice(0, 6)}`;
      if (c.key) c.key = ensure(c.key);
      if (c.children)
        c.children = c.children.map((nn: any) => {
          const cc = deep(nn);
          cc.id = `fld_${crypto.randomUUID().slice(0, 6)}`;
          if (cc.key) cc.key = ensure(cc.key);
          return cc;
        });
      return c;
    });
    const sections = [...state.sections];
    sections.splice(idx + 1, 0, clone);
    return {
      ...state,
      sections,
      selected: { type: 'section', id: clone.id },
      dirty: true,
    };
  }),

  removeSection: (id) => set((state) => {
    const sections = (state.sections || []).filter((s: any) => s.id !== id);
    if (sections.length === 0) {
      const fallbackId = `sec_${crypto.randomUUID().slice(0, 6)}`;
      sections.push({ type: 'section', id: fallbackId, title: 'Sección 1', children: [] });
      return {
        ...state,
        sections,
        selected: { type: 'section', id: fallbackId },
        dirty: true,
      };
    }
    return { ...state, sections, selected: null, dirty: true };
  }),
  addField: (sectionId, typeOrNode) => {
    const sections = get().sections || [];
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (idx < 0) return;

    const node = typeof typeOrNode === 'string'
      ? newField(typeOrNode as FieldType)
      : { ...typeOrNode };
    node.id = node.id ?? `fld_${crypto.randomUUID().slice(0, 6)}`;
    node.key = get().ensureUniqueKey(node.key || node.type || 'campo');

    const sec = sections[idx];
    const next = [...sections];
    next[idx] = { ...sec, children: [...(sec.children || []), node] };

    set({ sections: next, selected: { type: 'field', id: node.id }, dirty: true });

    return node.id;
  },

  /** Busca un nodo por id y devuelve punteros: sección y posición del field */
  _locateNode(id: string) {
    const sections = get().sections || [];
    for (let si = 0; si < sections.length; si++) {
      const s = sections[si];
      const list = s.children || [];
      const fi = list.findIndex((n: any) => n.id === id);
      if (fi >= 0) return { si, fi, section: s, node: list[fi] };
      // soporte para hijos del grupo (group.children)
      for (let gi = 0; gi < list.length; gi++) {
        const g = list[gi];
        if (g?.type === 'group') {
          const inner = g.children || [];
          const ii = inner.findIndex((n: any) => n.id === id);
          if (ii >= 0) return { si, fi: gi, section: s, node: inner[ii], groupIndex: gi, innerIndex: ii };
        }
      }
    }
    return null;
  },

  setSelected: (sel: Selected) => set({ selected: sel }),

  findSectionIdByField: (fieldId: string) => {
    const secs = get().sections || [];
    for (const s of secs) {
      if ((s.children || []).some((n: any) => n.id === fieldId)) return s.id;
    }
    return null;
  },

  getSectionIdForInsert: () => {
    const { selected, sections } = get();
    if (selected?.type === 'section') return selected.id;
    if (selected?.type === 'field') {
      const sid = get().findSectionIdByField(selected.id);
      if (sid) return sid;
    }
    if (sections?.length) return sections[sections.length - 1].id;
    return get().addSection();
  },

  updateNode: (id: string, patch: any) => set((state) => {
    const hit = (get() as any)._locateNode(id);
    if (!hit) return state;
    const sections = [...state.sections];
    if (hit.groupIndex != null) {
      const grp = { ...sections[hit.si].children[hit.groupIndex] } as any;
      const inner = [...(grp.children || [])];
      inner[hit.innerIndex] = { ...inner[hit.innerIndex], ...patch };
      grp.children = inner;
      const out = [...(sections[hit.si].children || [])];
      out[hit.groupIndex] = grp;
      sections[hit.si] = { ...sections[hit.si], children: out };
    } else {
      const list = [...(sections[hit.si].children || [])];
      list[hit.fi] = { ...list[hit.fi], ...patch };
      sections[hit.si] = { ...sections[hit.si], children: list };
    }
    return { ...state, sections, dirty: true };
  }),

  removeNode: (id: string) => set((state) => {
    const hit = (get() as any)._locateNode(id);
    if (!hit) return state;
    const sections = [...state.sections];
    if (hit.groupIndex != null) {
      const grp = { ...sections[hit.si].children[hit.groupIndex] } as any;
      grp.children = (grp.children || []).filter((_: any, i: number) => i !== hit.innerIndex);
      const out = [...(sections[hit.si].children || [])];
      out[hit.groupIndex] = grp;
      sections[hit.si] = { ...sections[hit.si], children: out };
    } else {
      sections[hit.si] = {
        ...sections[hit.si],
        children: (sections[hit.si].children || []).filter((_: any, i: number) => i !== hit.fi),
      };
    }
    return { ...state, sections, selected: null, dirty: true };
  }),

  duplicateNode: (id: string) => set((state) => {
    const hit = (get() as any)._locateNode(id);
    if (!hit) return state;
    const sections = [...state.sections];
    const clone = (obj: any) => JSON.parse(JSON.stringify(obj));
    const node = clone(hit.node);
    node.id = `fld_${crypto.randomUUID().slice(0, 6)}`;
    node.key = state.ensureUniqueKey(node.key || node.type);
    if (hit.groupIndex != null) {
      const grp = { ...sections[hit.si].children[hit.groupIndex] } as any;
      const inner = [...(grp.children || [])];
      inner.splice(hit.innerIndex + 1, 0, node);
      grp.children = inner;
      const out = [...(sections[hit.si].children || [])];
      out[hit.groupIndex] = grp;
      sections[hit.si] = { ...sections[hit.si], children: out };
    } else {
      const list = [...(sections[hit.si].children || [])];
      list.splice(hit.fi + 1, 0, node);
      sections[hit.si] = { ...sections[hit.si], children: list };
    }
    return { ...state, sections, selected: { type: 'field', id: node.id }, dirty: true };
  }),

  moveSection: (activeId, overId) => set((state) => {
    const from = state.sections.findIndex((s: any) => s.id === activeId);
    const to = state.sections.findIndex((s: any) => s.id === overId);
    if (from < 0 || to < 0 || from === to) return state;
    return { ...state, sections: arrayMove(state.sections, from, to), dirty: true };
  }),

  moveField: (activeId, overId, toSectionId) => set((state) => {
    // localizar origen
    let fromSi = -1, fromIdx = -1, node: any = null;
    state.sections.forEach((s: any, si: number) => {
      const idx = (s.children || []).findIndex((n: any) => n.id === activeId);
      if (idx >= 0) { fromSi = si; fromIdx = idx; node = s.children[idx]; }
    });
    if (fromSi < 0 || !node) return state;

    // decidir sección destino
    let destSi = fromSi;
    if (toSectionId) {
      destSi = state.sections.findIndex((s: any) => s.id === toSectionId);
      if (destSi < 0) destSi = fromSi;
    } else if (overId) {
      // si "over" es un campo, su sección es el destino
      const hit = state.sections.findIndex((s: any) => (s.children || []).some((n: any) => n.id === overId));
      if (hit >= 0) destSi = hit;
    }

    const sections = state.sections.map((s: any) => ({ ...s, children: [...(s.children || [])] }));

    // quitar del origen
    const [removed] = sections[fromSi].children.splice(fromIdx, 1);

    // decidir índice destino
    let destIndex = sections[destSi].children.length; // por defecto al final
    if (overId) {
      const idxOver = sections[destSi].children.findIndex((n: any) => n.id === overId);
      if (idxOver >= 0) destIndex = idxOver; // insertar antes del "over"
    }

    sections[destSi].children.splice(destIndex, 0, removed);

    return { ...state, sections, selected: { type: 'field', id: removed.id }, dirty: true };
  }),

  validateAll: () => {
    const errs: ValidationError[] = [];
    const { sections } = get();

    if (!sections || sections.length === 0) {
      errs.push({ code: 'NO_SECTIONS', message: 'Debe existir al menos una sección.' });
      return errs;
    }

    // No permitir secciones vacías, y recolectar keys
    const keySet = new Set<string>();
    const numericKeys = new Set<string>();

    sections.forEach((sec, i) => {
      const path = [`Sección ${i + 1}`];
      const children = sec.children || [];

      if (children.length === 0) {
        errs.push({ code: 'EMPTY_SECTION', message: 'La sección no puede estar vacía.', path });
      }

      children.forEach((n, j) => {
        const fpath = [...path, n.label || n.key || `Campo ${j + 1}`];

        // key
        if (!n.key || !n.key.trim()) {
          errs.push({ code: 'MISSING_KEY', message: 'Falta la key del campo.', path: fpath });
        } else if (keySet.has(n.key)) {
          errs.push({ code: 'DUP_KEY', message: `Key duplicada: "${n.key}"`, path: fpath });
        } else {
          keySet.add(n.key);
        }

        // select/multiselect/dropdown => al menos 1 opción
        if (isSelectType(n.type)) {
          const opts = Array.isArray(n.options) ? n.options : [];
          if (opts.length === 0) {
            errs.push({ code: 'EMPTY_OPTIONS', message: 'Debe definir al menos 1 opción.', path: fpath });
          }
        }

        // number: recolectar keys numéricas
        if (n.type === 'number' && n.key) numericKeys.add(n.key);

        // sum: sources deben ser numéricas válidas
        if (n.type === 'sum') {
          const sources = Array.isArray(n.sources) ? n.sources : [];
          const invalid = sources.filter((s: string) => !numericKeys.has(s));
          if (invalid.length) {
            errs.push({
              code: 'SUM_SOURCES',
              message: `Las fuentes de suma deben ser campos numéricos. Inválidas: ${invalid.join(', ')}`,
              path: fpath,
            });
          }
        }
      });
    });

    return errs;
  },

  /** Keys disponibles por tipo (útil para sum.sources) */
  collectKeysByType: (t: string) => {
    const keys: string[] = [];
    const walk = (nodes: any[]) => nodes.forEach(n => {
      if (n.type === 'section') return walk(n.children || []);
      if (n.type === 'group') return walk(n.children || []);
      if (n.key && (t === '*' || n.type === t)) keys.push(n.key);
    });
    walk(get().sections || []);
    return keys;
  },

  ensureUniqueKey: (base) => {
    const keys = new Set<string>();
    (get().sections || []).forEach((s: any) => (s.children || []).forEach((n: any) => n.key && keys.add(n.key)));
    let k = base;
    let c = 2;
    while (keys.has(k)) k = `${base}_${c++}`;
    return k;
  },

  setDirty: (d) => set({ dirty: d }),
  setTemplate: (tpl) => set(() => ({
    plantillaId: tpl?.id ?? null,
    nombre: tpl?.nombre ?? "",
    version: tpl?.version ?? 1,
    descripcion: tpl?.descripcion ?? null,
    sections: tpl?.schema?.nodes ?? tpl?.nodes ?? [],
    selected: null,
    dirty: false,
  })),
  setNombre: (n) => set({ nombre: n, dirty: true }),
  resetDirty: () => set({ dirty: false }),
  buildSchema: () => {
    const nodes = get().sections || [];
    return { id: get().plantillaId || undefined, name: get().nombre, version: get().version, nodes };
  },
}));
