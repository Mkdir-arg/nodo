import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from './useBuilderStore';
import type { SectionNode, FieldNode } from '@/lib/forms/types';

describe('useBuilderStore', () => {
  beforeEach(() => {
    useBuilderStore.setState({ nodes: [], dirty: false });
  });

  describe('addSection', () => {
    it('should add a new section with correct order', () => {
      const store = useBuilderStore.getState();
      
      const sectionId = store.addSection('Test Section');
      
      const sections = store.nodes.filter(n => n.kind === 'section') as SectionNode[];
      expect(sections).toHaveLength(1);
      expect(sections[0].id).toBe(sectionId);
      expect(sections[0].title).toBe('Test Section');
      expect(sections[0].order).toBe(0);
      expect(store.dirty).toBe(true);
    });
  });

  describe('addField', () => {
    it('should add a field to a section', () => {
      const store = useBuilderStore.getState();
      const sectionId = store.addSection('Test Section');
      
      const fieldId = store.addField(sectionId, { type: 'text', colSpan: 6 });
      
      const fields = store.nodes.filter(n => n.kind === 'field') as FieldNode[];
      expect(fields).toHaveLength(1);
      expect(fields[0].id).toBe(fieldId);
      expect(fields[0].type).toBe('text');
      expect(fields[0].colSpan).toBe(6);
      expect(fields[0].parentId).toBe(sectionId);
      expect(fields[0].order).toBe(0);
    });
  });

  describe('moveSection', () => {
    it('should reorder sections correctly', () => {
      const store = useBuilderStore.getState();
      const section1Id = store.addSection('Section 1');
      const section2Id = store.addSection('Section 2');
      const section3Id = store.addSection('Section 3');
      
      store.moveSection(section1Id, 2); // Move first to last
      
      const sections = store.nodes
        .filter(n => n.kind === 'section')
        .sort((a, b) => a.order - b.order) as SectionNode[];
      
      expect(sections[0].id).toBe(section2Id);
      expect(sections[1].id).toBe(section3Id);
      expect(sections[2].id).toBe(section1Id);
    });
  });

  describe('resizeField', () => {
    it('should update field colSpan within valid range', () => {
      const store = useBuilderStore.getState();
      const sectionId = store.addSection('Test Section');
      const fieldId = store.addField(sectionId, { type: 'text', colSpan: 6 });
      
      store.resizeField(fieldId, 8);
      
      const field = store.nodes.find(n => n.id === fieldId) as FieldNode;
      expect(field.colSpan).toBe(8);
    });

    it('should clamp colSpan to valid range', () => {
      const store = useBuilderStore.getState();
      const sectionId = store.addSection('Test Section');
      const fieldId = store.addField(sectionId, { type: 'text', colSpan: 6 });
      
      store.resizeField(fieldId, 15); // Above max
      let field = store.nodes.find(n => n.id === fieldId) as FieldNode;
      expect(field.colSpan).toBe(12);
      
      store.resizeField(fieldId, -1); // Below min
      field = store.nodes.find(n => n.id === fieldId) as FieldNode;
      expect(field.colSpan).toBe(1);
    });
  });

  describe('moveFieldWithin', () => {
    it('should reorder fields within the same section', () => {
      const store = useBuilderStore.getState();
      const sectionId = store.addSection('Test Section');
      const field1Id = store.addField(sectionId, { type: 'text', colSpan: 6 });
      const field2Id = store.addField(sectionId, { type: 'text', colSpan: 6 });
      const field3Id = store.addField(sectionId, { type: 'text', colSpan: 6 });
      
      store.moveFieldWithin(sectionId, field1Id, 2); // Move first to last
      
      const fields = store.nodes
        .filter(n => n.kind === 'field' && n.parentId === sectionId)
        .sort((a, b) => a.order - b.order) as FieldNode[];
      
      expect(fields[0].id).toBe(field2Id);
      expect(fields[1].id).toBe(field3Id);
      expect(fields[2].id).toBe(field1Id);
    });
  });

  describe('moveFieldAcross', () => {
    it('should move field between sections', () => {
      const store = useBuilderStore.getState();
      const section1Id = store.addSection('Section 1');
      const section2Id = store.addSection('Section 2');
      const fieldId = store.addField(section1Id, { type: 'text', colSpan: 6 });
      
      store.moveFieldAcross(section1Id, section2Id, fieldId, 0);
      
      const field = store.nodes.find(n => n.id === fieldId) as FieldNode;
      expect(field.parentId).toBe(section2Id);
      expect(field.order).toBe(0);
    });
  });

  describe('toFormLayout and loadFromFormLayout', () => {
    it('should serialize and deserialize correctly', () => {
      const store = useBuilderStore.getState();
      const sectionId = store.addSection('Test Section');
      const fieldId = store.addField(sectionId, { type: 'text', colSpan: 8 });
      
      const layout = store.toFormLayout();
      expect(layout.version).toBe(1);
      expect(layout.nodes).toHaveLength(2);
      
      // Clear and reload
      useBuilderStore.setState({ nodes: [], dirty: false });
      store.loadFromFormLayout(layout);
      
      const reloadedNodes = useBuilderStore.getState().nodes;
      expect(reloadedNodes).toHaveLength(2);
      expect(reloadedNodes.find(n => n.id === sectionId)).toBeDefined();
      expect(reloadedNodes.find(n => n.id === fieldId)).toBeDefined();
    });
  });
});