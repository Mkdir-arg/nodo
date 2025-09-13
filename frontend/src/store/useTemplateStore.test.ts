import { describe, it, expect } from 'vitest';
import { useTemplateStore } from './useTemplateStore';

describe('useTemplateStore', () => {
  it('ensureUniqueKey appends increment', () => {
    useTemplateStore.setState({ nodes: [{id:'1', key:'a'}] });
    const k = useTemplateStore.getState().ensureUniqueKey('a');
    expect(k).toBe('a_1');
  });
  it('sets dirty on addNode', () => {
    useTemplateStore.setState({ nodes: [], dirty: false });
    useTemplateStore.getState().addNode({ id: '1', key: 'a' });
    expect(useTemplateStore.getState().dirty).toBe(true);
  });
});
