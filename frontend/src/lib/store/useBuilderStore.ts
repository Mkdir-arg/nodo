import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { FormLayout, SectionNode, FieldNode } from '@/lib/forms/types';

interface BuilderState {
  nodes: Array<SectionNode | FieldNode>;
  dirty: boolean;
  
  // Actions
  addSection: (title?: string) => void;
  addField: (sectionId: string, field: Partial<FieldNode>) => void;
  moveSection: (sectionId: string, toIndex: number) => void;
  moveFieldWithin: (sectionId: string, fieldId: string, toIndex: number) => void;
  moveFieldAcross: (fromSectionId: string, toSectionId: string, fieldId: string, toIndex: number) => void;
  resizeField: (fieldId: string, colSpan: number) => void;
  reindex: () => void;
  markDirty: () => void;
  clearDirty: () => void;
  toFormLayout: () => FormLayout;
  getFormLayout: () => FormLayout;
  loadFromFormLayout: (layout: FormLayout) => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  nodes: [],
  dirty: false,

  addSection: (title = 'Nueva Sección') => {
    const sections = get().nodes.filter(n => n.kind === 'section');
    const newSection: SectionNode = {
      id: nanoid(),
      kind: 'section',
      title,
      columns: 12,
      order: sections.length
    };
    
    set(state => ({
      nodes: [...state.nodes, newSection],
      dirty: true
    }));
  },

  addField: (sectionId: string, field: Partial<FieldNode>) => {
    const fieldsInSection = get().nodes.filter(n => 
      n.kind === 'field' && n.parentId === sectionId
    );
    
    const newField: FieldNode = {
      id: nanoid(),
      kind: 'field',
      parentId: sectionId,
      type: field.type || 'text',
      colSpan: field.colSpan || 12,
      order: fieldsInSection.length,
      props: field.props || {}
    };
    
    set(state => ({
      nodes: [...state.nodes, newField],
      dirty: true
    }));
  },

  moveSection: (sectionId: string, toIndex: number) => {
    const sections = get().nodes.filter(n => n.kind === 'section');
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const reorderedSections = [...sections];
    const [moved] = reorderedSections.splice(sectionIndex, 1);
    reorderedSections.splice(toIndex, 0, moved);

    const updatedNodes = get().nodes.map(node => {
      if (node.kind === 'section') {
        const newIndex = reorderedSections.findIndex(s => s.id === node.id);
        return { ...node, order: newIndex };
      }
      return node;
    });

    set({ nodes: updatedNodes, dirty: true });
  },

  moveFieldWithin: (sectionId: string, fieldId: string, toIndex: number) => {
    const fieldsInSection = get().nodes.filter(n => 
      n.kind === 'field' && n.parentId === sectionId
    );
    const fieldIndex = fieldsInSection.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;

    const reorderedFields = [...fieldsInSection];
    const [moved] = reorderedFields.splice(fieldIndex, 1);
    reorderedFields.splice(toIndex, 0, moved);

    const updatedNodes = get().nodes.map(node => {
      if (node.kind === 'field' && node.parentId === sectionId) {
        const newIndex = reorderedFields.findIndex(f => f.id === node.id);
        return { ...node, order: newIndex };
      }
      return node;
    });

    set({ nodes: updatedNodes, dirty: true });
  },

  moveFieldAcross: (fromSectionId: string, toSectionId: string, fieldId: string, toIndex: number) => {
    const fieldsInTarget = get().nodes.filter(n => 
      n.kind === 'field' && n.parentId === toSectionId
    );

    const updatedNodes = get().nodes.map(node => {
      if (node.id === fieldId) {
        return { ...node, parentId: toSectionId, order: toIndex };
      }
      if (node.kind === 'field' && node.parentId === toSectionId && node.order >= toIndex) {
        return { ...node, order: node.order + 1 };
      }
      return node;
    });

    set({ nodes: updatedNodes, dirty: true });
    get().reindex();
  },

  resizeField: (fieldId: string, colSpan: number) => {
    const clampedSpan = Math.max(1, Math.min(12, colSpan));
    
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === fieldId && node.kind === 'field' 
          ? { ...node, colSpan: clampedSpan }
          : node
      ),
      dirty: true
    }));
  },

  reindex: () => {
    const sections = get().nodes.filter(n => n.kind === 'section');
    const updatedNodes = get().nodes.map(node => {
      if (node.kind === 'section') {
        const newIndex = sections.findIndex(s => s.id === node.id);
        return { ...node, order: newIndex };
      }
      if (node.kind === 'field') {
        const fieldsInSection = get().nodes.filter(n => 
          n.kind === 'field' && n.parentId === node.parentId
        );
        const newIndex = fieldsInSection.findIndex(f => f.id === node.id);
        return { ...node, order: newIndex };
      }
      return node;
    });

    set({ nodes: updatedNodes });
  },

  markDirty: () => set({ dirty: true }),
  clearDirty: () => set({ dirty: false }),

  toFormLayout: (): FormLayout => ({
    version: 1,
    nodes: get().nodes
  }),

  getFormLayout: (): FormLayout => ({
    version: 1,
    nodes: get().nodes
  }),

  loadFromFormLayout: (layout: FormLayout) => {
    set({ 
      nodes: layout.nodes || [],
      dirty: false 
    });
  }
}));