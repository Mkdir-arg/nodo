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
});
