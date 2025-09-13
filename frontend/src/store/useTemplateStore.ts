'use client';
import { create } from 'zustand';
import { Template } from '@/lib/schema';

type State = {
  nodes: any[];
  selected?: any;
  addNode: (n: any) => void;
  updateNode: (id: string, patch: any) => void;
  setTemplate: (t: Template) => void;
  ensureUniqueKey: (base: string) => string;
};

export const useTemplateStore = create<State>((set) => ({
  nodes: [],
  selected: undefined,
  addNode: (n) => set((s) => ({ nodes: [...s.nodes, n] })),
  updateNode: (id, patch) => set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)), selected: s.selected && s.selected.id === id ? { ...s.selected, ...patch } : s.selected })),
  setTemplate: (t) => set(() => ({ nodes: t.nodes })),
  ensureUniqueKey: (base) => {
    let key = base;
    let i = 1;
    set((s)=>{return s});
    while (useTemplateStore.getState().nodes.some((n:any)=>n.key===key)) {
      key = `${base}_${i++}`;
    }
    return key;
  },
}));
