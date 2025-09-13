'use client';
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { newField, FieldType } from '@/lib/form-builder/factory';

type FieldNode = any;
interface Section { id: string; title?: string; children: FieldNode[]; }
interface Selected { type: 'section' | 'field'; id: string; }

interface State {
  sections: Section[];
  selected: Selected | null;
  dirty: boolean;
  addSection: () => string;
  addField: (sectionId: string, typeOrNode: FieldType | FieldNode) => void;
  updateNode: (id: string, patch: any) => void;
  ensureUniqueKey: (base: string) => string;
  setSelected: (sel: Selected | null) => void;
  setDirty: (d: boolean) => void;
  setTemplate: (t: any) => void;
}

export const useBuilderStore = create<State>((set, get) => ({
  sections: [],
  selected: null,
  dirty: false,
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
  addField: (sectionId, typeOrNode) => set(state => {
    const idx = state.sections.findIndex(s => s.id === sectionId);
    if (idx < 0) return state;
    const node = typeof typeOrNode === 'string'
      ? newField(typeOrNode as FieldType)
      : { ...typeOrNode };
    node.id = node.id || `fld_${nanoid(6)}`;
    node.key = state.ensureUniqueKey(node.key || node.type);
    const sections = [...state.sections];
    const sec = sections[idx];
    sections[idx] = { ...sec, children: [...(sec.children || []), node] };
    return { ...state, sections, selected: { type: 'field', id: node.id }, dirty: true };
  }),
  updateNode: (id, patch) => set(state => {
    const sections = state.sections.map(sec => ({
      ...sec,
      children: sec.children.map(f => (f.id === id ? { ...f, ...patch } : f)),
    }));
    const selected = state.selected && state.selected.id === id ? { ...state.selected, ...patch } : state.selected;
    return { ...state, sections, selected, dirty: true };
  }),
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
  setSelected: (sel) => set({ selected: sel }),
  setDirty: (d) => set({ dirty: d }),
  setTemplate: (t) => set(() => ({ sections: t.sections || [], dirty: false })),
}));
