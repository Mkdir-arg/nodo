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
  addSection: () => void;
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
  addSection: () => set(state => ({
    sections: [...state.sections, { id: `sec_${nanoid(6)}`, title: 'Sección', children: [] }],
    dirty: true,
  })),
  addField: (sectionId, typeOrNode) => set(state => {
    const secIdx = state.sections.findIndex(s => s.id === sectionId);
    if (secIdx < 0) return state;
    const node = typeof typeOrNode === 'string' ? newField(typeOrNode as FieldType) : typeOrNode;
    node.key = get().ensureUniqueKey(node.key || node.type);
    const sections = [...state.sections];
    const section = sections[secIdx];
    sections[secIdx] = { ...section, children: [...(section.children || []), node] };
    return { ...state, sections, dirty: true };
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
    let key = base;
    let i = 1;
    const fields = get().sections.flatMap(sec => sec.children || []);
    while (fields.some(f => f.key === key)) {
      key = `${base}_${i++}`;
    }
    return key;
  },
  setSelected: (sel) => set({ selected: sel }),
  setDirty: (d) => set({ dirty: d }),
  setTemplate: (t) => set(() => ({ sections: t.sections || [], dirty: false })),
}));
