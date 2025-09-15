'use client';
import { create } from 'zustand';
import { FieldType, createNode, defLayout } from '@/lib/form-builder/factory';
import { arrayMove } from '@dnd-kit/sortable';


export type ValidationError = { code: string; message: string; path?: string[] };

function isSelectType(t: string) {
  return ['select', 'multiselect', 'dropdown', 'select_with_filter'].includes(t);
}


export type FieldNode = {
  id: string;
  type: string;
  kind?: string;
  key?: string;
  label?: string;
  layout?: { i: string; x: number; y: number; w: number; h: number };
  config?: any;
  [k: string]: any;
};

export type SectionNode = {
  id: string;
  title?: string;
  nodes: FieldNode[];
  children?: FieldNode[];
  layout_mode?: 'flow' | 'grid';
  [k: string]: any;
};

const isUiNode = (node: any) => node?.kind === 'ui' || String(node?.type || '').startsWith('ui:');

function ensureLayout(node: any): FieldNode {
  const id = node.id ?? `fld_${crypto.randomUUID().slice(0, 6)}`;
  const kind = node.kind ?? (isUiNode(node) ? 'ui' : 'field');
  const baseLayout = node.layout ?? {};
  const layoutDefaults = defLayout(node.type ?? '');
  const layout = {
    i: baseLayout.i ?? id,
    x: typeof baseLayout.x === 'number' ? baseLayout.x : 0,
    y: typeof baseLayout.y === 'number' ? baseLayout.y : Number.POSITIVE_INFINITY,
    w: baseLayout.w ?? layoutDefaults.w,
    h: baseLayout.h ?? layoutDefaults.h,
  };
  return { ...node, id, kind, layout };
}

function normalizeSection(section: any): SectionNode {
  const nodes = (section?.nodes ?? section?.children ?? [])
    .filter(Boolean)
    .map((node: any) => ensureLayout(node));
  const layout_mode: 'flow' | 'grid' = section?.layout_mode === 'grid' ? 'grid' : 'flow';
  const normalized: SectionNode = {
    ...section,
    id: section?.id ?? `sec_${crypto.randomUUID().slice(0, 6)}`,
    title: section?.title,
    layout_mode,
    nodes,
    children: nodes,
  };
  return normalized;
}

function syncSection(section: SectionNode): SectionNode {
  const nodes = (section.nodes || []).map((node) => ensureLayout(node));
  const layout_mode: 'flow' | 'grid' = section.layout_mode === 'grid' ? 'grid' : 'flow';
  return { ...section, layout_mode, nodes, children: nodes };
}

type Selected = { type: 'section' | 'field'; id: string } | null;

export interface BuilderState {
  sections: SectionNode[];
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

  addField: (sectionId: string, typeOrNode: string | FieldNode) => string | undefined;
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

export const useBuilderStore = create<BuilderState>((set, get) => ({
  sections: [],
  selected: null,
  dirty: false,

  plantillaId: null,
  nombre: '',
  version: 1,
  descripcion: null,

  addSection: () => {
    const n = (get().sections?.length || 0) + 1;
    const id = `sec_${crypto.randomUUID().slice(0, 6)}`;
    const section: SectionNode = { id, title: `Sección ${n}`, nodes: [], children: [], layout_mode: 'flow' };
    set((s) => {
      const sections = [...(s.sections || []), syncSection(section)];
      return {
        sections,
        selected: { type: 'section', id },
        dirty: true,
      };
    });
    return id;
  },

  updateSection: (id, patch) =>
    set((state) => {
      const sections = (state.sections || []).map((s: SectionNode) => {
        if (s.id !== id) return s;
        const next: SectionNode = {
          ...s,
          ...patch,
        };
        if (patch?.nodes) {
          next.nodes = (patch.nodes as any[]).map((node) => ensureLayout(node));
        }
        return syncSection(next);
      });
      return { ...state, sections, dirty: true };
    }),

  duplicateSection: (id) =>
    set((state) => {
      const idx = (state.sections || []).findIndex((s: any) => s.id === id);
      if (idx < 0) return state;

      const deep = (o: any) => JSON.parse(JSON.stringify(o));
      const source = syncSection(state.sections[idx]);
      const clone = deep(source);
      clone.id = `sec_${crypto.randomUUID().slice(0, 6)}`;
      clone.title = `${clone.title || 'Sección'} (copia)`;

      const ensure = state.ensureUniqueKey;
      const nodes = (clone.nodes || clone.children || []).map((n: any) => {
        const c = deep(n);
        c.id = `fld_${crypto.randomUUID().slice(0, 6)}`;
        if (!isUiNode(c)) {
          c.key = ensure(c.key || c.type);
        }
        if (c.children)
          c.children = (c.children || []).map((nn: any) => {
            const cc = deep(nn);
            cc.id = `fld_${crypto.randomUUID().slice(0, 6)}`;
            if (!isUiNode(cc)) {
              cc.key = ensure(cc.key || cc.type);
            }
            return ensureLayout(cc);
          });
        return ensureLayout(c);
      });
      clone.nodes = nodes;

      const sections = [...state.sections];
      sections.splice(idx + 1, 0, syncSection(clone));
      return { ...state, sections, selected: { type: 'section', id: clone.id }, dirty: true };
    }),

  removeSection: (id) =>
    set((state) => {
      const sections = (state.sections || []).filter((s: any) => s.id !== id);
      if (sections.length === 0) {
        const fallbackId = `sec_${crypto.randomUUID().slice(0, 6)}`;
        sections.push(syncSection({ id: fallbackId, title: 'Sección 1', nodes: [], layout_mode: 'flow' } as SectionNode));
        return { ...state, sections, selected: { type: 'section', id: fallbackId }, dirty: true };
      }
      return { ...state, sections: sections.map((s) => syncSection(s)), selected: null, dirty: true };
    }),

  addField: (sectionId, typeOrNode) => {
    const sections = get().sections || [];
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (idx < 0) return;

    const rawNode: FieldNode =
      typeof typeOrNode === 'string' ? (createNode(typeOrNode) as any) : ensureLayout({ ...(typeOrNode as any) });

    const id = rawNode.id ?? `fld_${crypto.randomUUID().slice(0, 6)}`;
    const node = ensureLayout({ ...rawNode, id });
    if (!isUiNode(node)) {
      node.key = get().ensureUniqueKey(node.key || node.type || 'campo');
    }

    const sec = sections[idx];
    const nodes = [...(sec.nodes || sec.children || []), node];
    const next = [...sections];
    next[idx] = syncSection({ ...sec, nodes });

    set({ sections: next, selected: { type: 'field', id }, dirty: true });

    return id;
  },

  _locateNode(id: string) {
    const sections = get().sections || [];
    for (let si = 0; si < sections.length; si++) {
      const s = sections[si];
      const list = s.nodes || s.children || [];
      const fi = list.findIndex((n: any) => n.id === id);
      if (fi >= 0) return { si, fi, section: s, node: list[fi] };
      // soporte para grupos
      for (let gi = 0; gi < list.length; gi++) {
        const g = list[gi];
        if (g?.type === 'group') {
          const inner = g.children || [];
          const ii = inner.findIndex((n: any) => n.id === id);
          if (ii >= 0)
            return { si, fi: gi, section: s, node: inner[ii], groupIndex: gi, innerIndex: ii };
        }
      }
    }
    return null;
  },

  setSelected: (sel: Selected) => set({ selected: sel }),

  findSectionIdByField: (fieldId: string) => {
    const secs = get().sections || [];
    for (const s of secs) {
      if ((s.nodes || s.children || []).some((n: any) => n.id === fieldId)) return s.id;
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

  updateNode: (id: string, patch: any) =>
    set((state) => {
      const hit = (get() as any)._locateNode(id);
      if (!hit) return state;
      const sections = [...state.sections];
      const section = sections[hit.si];
      const nodes = [...(section.nodes || section.children || [])];

      if (hit.groupIndex != null) {
        const grp = { ...(nodes[hit.groupIndex] || {}) } as any;
        const inner = [...(grp.children || [])];
        inner[hit.innerIndex] = { ...inner[hit.innerIndex], ...patch };
        grp.children = inner;
        nodes[hit.groupIndex] = grp;
      } else {
        nodes[hit.fi] = { ...nodes[hit.fi], ...patch };
      }

      sections[hit.si] = syncSection({ ...section, nodes });
      return { ...state, sections, dirty: true };
    }),

  removeNode: (id: string) =>
    set((state) => {
      const hit = (get() as any)._locateNode(id);
      if (!hit) return state;
      const sections = [...state.sections];
      const section = sections[hit.si];
      const nodes = [...(section.nodes || section.children || [])];

      if (hit.groupIndex != null) {
        const grp = { ...(nodes[hit.groupIndex] || {}) } as any;
        grp.children = (grp.children || []).filter((_: any, i: number) => i !== hit.innerIndex);
        nodes[hit.groupIndex] = grp;
      } else {
        nodes.splice(hit.fi, 1);
      }
      sections[hit.si] = syncSection({ ...section, nodes });
      return { ...state, sections, selected: null, dirty: true };
    }),

  duplicateNode: (id: string) =>
    set((state) => {
      const hit = (get() as any)._locateNode(id);
      if (!hit) return state;
      const sections = [...state.sections];
      const clone = (obj: any) => JSON.parse(JSON.stringify(obj));
      const rawNode = clone(hit.node);
      rawNode.id = `fld_${crypto.randomUUID().slice(0, 6)}`;
      if (!isUiNode(rawNode)) {
        rawNode.key = state.ensureUniqueKey(rawNode.key || rawNode.type);
      }
      const node = ensureLayout(rawNode);

      const section = sections[hit.si];
      const nodes = [...(section.nodes || section.children || [])];

      if (hit.groupIndex != null) {
        const grp = { ...(nodes[hit.groupIndex] || {}) } as any;
        const inner = [...(grp.children || [])];
        inner.splice(hit.innerIndex + 1, 0, node);
        grp.children = inner;
        nodes[hit.groupIndex] = grp;
      } else {
        nodes.splice(hit.fi + 1, 0, node);
      }

      sections[hit.si] = syncSection({ ...section, nodes });
      return { ...state, sections, selected: { type: 'field', id: node.id }, dirty: true };
    }),

  moveSection: (activeId, overId) =>
    set((state) => {
      const from = state.sections.findIndex((s: any) => s.id === activeId);
      const to = state.sections.findIndex((s: any) => s.id === overId);
      if (from < 0 || to < 0 || from === to) return state;
      return { ...state, sections: arrayMove(state.sections, from, to), dirty: true };
    }),

  moveField: (activeId, overId, toSectionId) =>
    set((state) => {
      // localizar origen
      let fromSi = -1,
        fromIdx = -1,
        node: any = null;
      state.sections.forEach((s: any, si: number) => {
        const list = s.nodes || s.children || [];
        const idx = list.findIndex((n: any) => n.id === activeId);
        if (idx >= 0) {
          fromSi = si;
          fromIdx = idx;
          node = list[idx];
        }
      });
      if (fromSi < 0 || !node) return state;

      // decidir sección destino
      let destSi = fromSi;
      if (toSectionId) {
        destSi = state.sections.findIndex((s: any) => s.id === toSectionId);
        if (destSi < 0) destSi = fromSi;
      } else if (overId) {
        const hit = state.sections.findIndex((s: any) => (s.nodes || s.children || []).some((n: any) => n.id === overId));
        if (hit >= 0) destSi = hit;
      }

      const sections = state.sections.map((s: any) => syncSection(s));
      const fromSection = sections[fromSi];
      const fromNodes = [...(fromSection.nodes || [])];
      const [removed] = fromNodes.splice(fromIdx, 1);
      sections[fromSi] = syncSection({ ...fromSection, nodes: fromNodes });

      // decidir índice destino (por defecto al final)
      const destSection = sections[destSi];
      const destNodes = [...(destSection.nodes || [])];
      let destIndex = destNodes.length;
      if (overId) {
        const idxOver = destNodes.findIndex((n: any) => n.id === overId);
        if (idxOver >= 0) destIndex = idxOver; // insertar antes de "over"
      }

      destNodes.splice(destIndex, 0, removed);
      sections[destSi] = syncSection({ ...destSection, nodes: destNodes });

      return { ...state, sections, selected: { type: 'field', id: removed.id }, dirty: true };
    }),

  validateAll: () => {
    const errs: ValidationError[] = [];
    const { sections } = get();

    if (!sections || sections.length === 0) {
      errs.push({ code: 'NO_SECTIONS', message: 'Debe existir al menos una sección.' });
      return errs;
    }

    const keySet = new Set<string>();
    const numericKeys = new Set<string>();

    sections.forEach((sec, i) => {
      const path = [`Sección ${i + 1}`];
      const children = sec.nodes || sec.children || [];
      const dataChildren = children.filter((n: any) => n.kind !== 'ui');

      if (dataChildren.length === 0) {
        errs.push({ code: 'EMPTY_SECTION', message: 'La sección no puede estar vacía.', path });
      }

      dataChildren.forEach((n, j) => {
        const fpath = [...path, n.label || n.key || `Campo ${j + 1}`];

        if (!n.key || !n.key.trim()) {
          errs.push({ code: 'MISSING_KEY', message: 'Falta la key del campo.', path: fpath });
        } else if (keySet.has(n.key)) {
          errs.push({ code: 'DUP_KEY', message: `Key duplicada: "${n.key}"`, path: fpath });
        } else {
          keySet.add(n.key);
        }

        if (isSelectType(n.type)) {
          const opts = Array.isArray(n.options) ? n.options : [];
          if (opts.length === 0) {
            errs.push({ code: 'EMPTY_OPTIONS', message: 'Debe definir al menos 1 opción.', path: fpath });
          }
        }

        if (n.type === 'number' && n.key) numericKeys.add(n.key);

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

  collectKeysByType: (t: string) => {
    const keys: string[] = [];
    const walk = (nodes: any[]) =>
      nodes.forEach((n) => {
        if (n.type === 'section') return walk(n.children || []);
        if (n.type === 'group') return walk(n.children || []);
        if (n.key && (t === '*' || n.type === t)) keys.push(n.key);
      });
    (get().sections || []).forEach((s: any) => walk(s.nodes || s.children || []));
    return keys;
  },

  ensureUniqueKey: (base) => {
    const keys = new Set<string>();
    (get().sections || []).forEach((s: any) => (s.nodes || s.children || []).forEach((n: any) => n.key && keys.add(n.key)));
    let k = base;
    let c = 2;
    while (keys.has(k)) k = `${base}_${c++}`;
    return k;
  },

  setDirty: (d) => set({ dirty: d }),

  setTemplate: (tpl) =>
    set(() => {
      const rawSections =
        tpl?.schema?.sections ?? tpl?.schema?.nodes ?? tpl?.sections ?? tpl?.nodes ?? [];
      const sections = Array.isArray(rawSections)
        ? rawSections.map((sec: any) => normalizeSection(sec))
        : [];
      return {
        plantillaId: tpl?.id ?? null,
        nombre: tpl?.nombre ?? '',
        version: tpl?.version ?? 1,
        descripcion: tpl?.descripcion ?? null,
        sections,
        selected: null,
        dirty: false,
      };
    }),

  setNombre: (n) => set({ nombre: n, dirty: true }),
  resetDirty: () => set({ dirty: false }),

  buildSchema: () => {
    const sections = (get().sections || []).map((sec) => syncSection(sec));
    return { id: get().plantillaId || undefined, name: get().nombre, version: get().version, nodes: sections };
  },
}));
