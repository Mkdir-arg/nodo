'use client';
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { newField, FieldType } from '@/lib/form-builder/factory';
import { arrayMove } from '@dnd-kit/sortable';

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
  addField: (sectionId: string, typeOrNode: FieldType | FieldNode) => string | undefined;
  updateNode: (id: string, patch: any) => void;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  moveSection: (activeId: string, overId: string) => void;
  moveField: (activeId: string, overId?: string | null, toSectionId?: string) => void;
  collectKeysByType: (t: string) => string[];
  ensureUniqueKey: (base: string) => string;
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
    let newId = '';
    set(state => {
      const id = `sec_${nanoid(6)}`;
      const title = `Sección ${state.sections.length + 1}`;
      const section = { type: 'section', id, title, collapsed: false, children: [] as any[] };
      newId = id;
      return {
        ...state,
        sections: [...state.sections, section],
        selected: { type: 'section', id },
        dirty: true,
      };
    });
    return newId;
  },
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
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
    const tryKey = slug(base || 'campo');
    const all = new Set<string>();
    const walk = (nodes: any[]) => nodes.forEach(n => {
      if (n.type === 'section') return walk(n.children || []);
      if (n.key) all.add(n.key);
    });
    walk(get().sections || []);
    if (!all.has(tryKey)) return tryKey;
    let i = 2;
    while (all.has(`${tryKey}_${i}`)) i++;
    return `${tryKey}_${i}`;
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
