import { describe, it, expect } from 'vitest';
import { useBuilderStore } from './usePlantillaBuilderStore';

describe('usePlantillaBuilderStore', () => {
  it('ensureUniqueKey appends increment', () => {
    useBuilderStore.setState({ sections: [{ id: 's1', children: [{ id: '1', key: 'a' }] }], selected: null, dirty: false });
    const k = useBuilderStore.getState().ensureUniqueKey('a');
    expect(k).toBe('a_1');
  });
  it('sets dirty on addField', () => {
    useBuilderStore.setState({ sections: [{ id: 's1', children: [] }], selected: null, dirty: false });
    useBuilderStore.getState().addField('s1', 'text');
    expect(useBuilderStore.getState().dirty).toBe(true);
  });
  it('addField accepts node objects and ensures unique key', () => {
    useBuilderStore.setState({ sections: [{ id: 's1', children: [{ id: '1', key: 'a', type: 'text' }] }], selected: null, dirty: false });
    useBuilderStore.getState().addField('s1', { id: '2', key: 'a', type: 'text' });
    const children = useBuilderStore.getState().sections[0].children;
    expect(children[1].key).toBe('a_1');
  });
});
