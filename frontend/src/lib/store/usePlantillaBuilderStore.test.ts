import { describe, it, expect } from 'vitest';
import { useBuilderStore } from './usePlantillaBuilderStore';

describe('usePlantillaBuilderStore', () => {
  it('ensureUniqueKey appends increment', () => {
    useBuilderStore.setState({
      sections: [{ id: 's1', children: [{ id: '1', key: 'a' }] }],
      selected: null,
      dirty: false,
    });
    const k = useBuilderStore.getState().ensureUniqueKey('a');
    expect(k).toBe('a_2');
  });

  it('sets dirty on addField', () => {
    useBuilderStore.setState({
      sections: [{ id: 's1', children: [] }],
      selected: null,
      dirty: false,
    });
    useBuilderStore.getState().addField('s1', 'text');
    const state = useBuilderStore.getState();
    expect(state.dirty).toBe(true);
    expect(state.selected?.type).toBe('field');
    expect(state.selected?.id).toBe(state.sections[0].children[0].id);
  });

  it('addField accepts node objects and ensures unique key', () => {
    useBuilderStore.setState({
      sections: [{ id: 's1', children: [{ id: '1', key: 'a', type: 'text' }] }],
      selected: null,
      dirty: false,
    });
    useBuilderStore.getState().addField('s1', { id: '2', key: 'a', type: 'text' });
    const children = useBuilderStore.getState().sections[0].children;
    expect(children[1].key).toBe('a_2');
  });

  it('addSection returns id and selects section', () => {
    useBuilderStore.setState({ sections: [], selected: null, dirty: false });
    const id = useBuilderStore.getState().addSection();
    const state = useBuilderStore.getState();
    expect(state.sections[0].id).toBe(id);
    expect(state.selected).toEqual({ type: 'section', id });
  });

  it('updateSection changes title and marks dirty', () => {
    useBuilderStore.setState({ sections: [{ id: 's1', title: 'Old', children: [] }], selected: null, dirty: false });
    useBuilderStore.getState().updateSection('s1', { title: 'New' });
    const state = useBuilderStore.getState();
    expect(state.sections[0].title).toBe('New');
    expect(state.dirty).toBe(true);
  });

  it('duplicateSection clones with new ids and keys', () => {
    useBuilderStore.setState({
      sections: [{ id: 's1', title: 'Sec', children: [{ id: 'f1', type: 'text', key: 'a' }] }],
      selected: null,
      dirty: false,
    });
    useBuilderStore.getState().duplicateSection('s1');
    const state = useBuilderStore.getState();
    expect(state.sections.length).toBe(2);
    const [orig, copy] = state.sections as any[];
    expect(copy.id).not.toBe(orig.id);
    expect(copy.children[0].id).not.toBe(orig.children[0].id);
    expect(copy.children[0].key).not.toBe(orig.children[0].key);
    expect(state.selected).toEqual({ type: 'section', id: copy.id });
    expect(state.dirty).toBe(true);
  });

  it('removeSection keeps one section', () => {
    useBuilderStore.setState({ sections: [{ id: 's1', title: 'Sec1', children: [] }], selected: null, dirty: false });
    useBuilderStore.getState().removeSection('s1');
    const state = useBuilderStore.getState();
    expect(state.sections.length).toBe(1);
    expect(state.sections[0].id).not.toBe('s1');
    expect(state.selected).toEqual({ type: 'section', id: state.sections[0].id });
    expect(state.dirty).toBe(true);
  });
});
