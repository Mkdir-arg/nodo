'use client';
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { FormLayout, SectionNode, FieldNode } from '@/lib/forms/types';

interface BuilderState {
  nodes: Array<SectionNode | FieldNode>;
  dirty: boolean;

  addSection: (title?: string) => string;
  addField: (sectionId: string, field: Partial<FieldNode>) => string;
  moveSection: (sectionId: string, toIndex: number) => void;
  moveFieldWithin: (sectionId: string, fieldId: string, toIndex: number) => void;
  moveFieldAcross: (fromSectionId: string, toSectionId: string, fieldId: string, toIndex: number) => void;
  resizeField: (fieldId: string, colSpan: number) => void;
  reindex: () => void;
  markDirty: () => void;
  clearDirty: () => void;
  toFormLayout: () => FormLayout;
  loadFromFormLayout: (layout: FormLayout) => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  nodes: [],
  dirty: false,

  addSection: (title = 'Nueva Sección') => {
    const id = nanoid();
    const sections = get().nodes.filter(n => n.kind === 'section');
    const order = sections.length;
    
    const section: SectionNode = {
      id,
      kind: 'section',
      title,
      columns: 12,
      order
    };

    set(state => ({
      nodes: [...state.nodes, section],
      dirty: true
    }));

    return id;
  },

  addField: (sectionId: string, field: Partial<FieldNode>) => {
    const id = nanoid();
    const fieldsInSection = get().nodes.filter(n => 
      n.kind === 'field' && n.parentId === sectionId
    );
    const order = fieldsInSection.length;

    const newField: FieldNode = {
      id,
      kind: 'field',
      type: field.type || 'text',
      colSpan: Math.min(Math.max(field.colSpan || 6, 1), 12),
      order,
      parentId: sectionId,
      props: field.props || {}
    };

    set(state => ({
      nodes: [...state.nodes, newField],
      dirty: true
    }));

    return id;
  },

  moveSection: (sectionId: string, toIndex: number) => {
    const sections = get().nodes.filter(n => n.kind === 'section') as SectionNode[];
    const fromIndex = sections.findIndex(s => s.id === sectionId);
    
    if (fromIndex === -1 || fromIndex === toIndex) return;

    const reorderedSections = [...sections];
    const [moved] = reorderedSections.splice(fromIndex, 1);
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
    ) as FieldNode[];
    
    const fromIndex = fieldsInSection.findIndex(f => f.id === fieldId);
    if (fromIndex === -1 || fromIndex === toIndex) return;

    const reorderedFields = [...fieldsInSection];
    const [moved] = reorderedFields.splice(fromIndex, 1);
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
    const fieldsInTargetSection = get().nodes.filter(n => 
      n.kind === 'field' && n.parentId === toSectionId
    ) as FieldNode[];

    const updatedNodes = get().nodes.map(node => {
      if (node.id === fieldId) {
        return { ...node, parentId: toSectionId, order: toIndex };
      }
      if (node.kind === 'field' && node.parentId === toSectionId) {
        const currentIndex = fieldsInTargetSection.findIndex(f => f.id === node.id);
        return { ...node, order: currentIndex >= toIndex ? currentIndex + 1 : currentIndex };
      }
      return node;
    });

    set({ nodes: updatedNodes, dirty: true });
    get().reindex();
  },

  resizeField: (fieldId: string, colSpan: number) => {
    const clampedColSpan = Math.min(Math.max(colSpan, 1), 12);
    
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === fieldId && node.kind === 'field' 
          ? { ...node, colSpan: clampedColSpan }
          : node
      ),
      dirty: true
    }));
  },

  reindex: () => {
    const sections = get().nodes.filter(n => n.kind === 'section') as SectionNode[];
    const fields = get().nodes.filter(n => n.kind === 'field') as FieldNode[];

    const updatedNodes = [
      ...sections.map((section, index) => ({ ...section, order: index })),
      ...fields.reduce((acc, field) => {
        const sectionFields = fields.filter(f => f.parentId === field.parentId);
        const sortedFields = sectionFields.sort((a, b) => a.order - b.order);
        const newOrder = sortedFields.findIndex(f => f.id === field.id);
        acc.push({ ...field, order: newOrder });
        return acc;
      }, [] as FieldNode[])
    ];

    set({ nodes: updatedNodes });
  },

  markDirty: () => set({ dirty: true }),
  clearDirty: () => set({ dirty: false }),

  toFormLayout: (): FormLayout => ({
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