import { create } from "zustand";
import { nanoid } from "nanoid";
import { Template, FieldDef, LayoutNode } from "../schema";

type BuilderState = {
  template: Template;
  selected?: { type: "field"|"node", key: string };
  setTemplate: (t: Template) => void;
  addField: (type: FieldDef["type"]) => FieldDef;
  addFieldToLayout: (fieldKey: string, parentPath: number[]) => void; // parentPath = índices para llegar al contenedor
  updateField: (key: string, patch: Partial<FieldDef>) => void;
};

export const useBuilder = create<BuilderState>((set,get)=>({
  template: { id: nanoid(), name:"Nueva Plantilla", slug:"nueva-plantilla", version:"0.1.0", status:"draft", fields:[], layout:[{type:"row", children:[{type:"col", span:12, children:[]}]}]},
  setTemplate: (t)=>set({ template: t }),
  addField: (type) => {
    const t = structuredClone(get().template);
    const f: FieldDef = { id: nanoid(), key: `campo_${t.fields.length+1}`, type, label: "Nuevo campo" };
    t.fields.push(f); set({ template: t }); return f;
  },
  addFieldToLayout: (fieldKey, parentPath) => {
    const t = structuredClone(get().template);
    // bajar por el árbol siguiendo parentPath
    let node: LayoutNode = { type:"row", children:t.layout } as any;
    let children = t.layout;
    for (const idx of parentPath) {
      const n = children[idx];
      if (!n.children) n.children = [];
      children = n.children;
    }
    children.push({ type:"field", fieldKey });
    set({ template: t });
  },
  updateField: (key, patch) => {
    const t = structuredClone(get().template);
    const idx = t.fields.findIndex(f=>f.key===key);
    if (idx>=0) t.fields[idx] = { ...t.fields[idx], ...patch };
    set({ template: t });
  }
}));
