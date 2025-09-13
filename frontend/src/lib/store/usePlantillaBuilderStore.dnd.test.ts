import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from './usePlantillaBuilderStore';

describe('DnD moves', () => {
  beforeEach(() => {
    useBuilderStore.setState({ sections: [], selected: null, dirty: false });
  });

  it('moveSection reorders sections', () => {
    useBuilderStore.setState({
      sections: [
        { id: 's1', children: [] },
        { id: 's2', children: [] },
        { id: 's3', children: [] },
      ],
      selected: null,
      dirty: false,
    });
    useBuilderStore.getState().moveSection('s1', 's3');
    expect(useBuilderStore.getState().sections.map((s: any) => s.id)).toEqual(['s2', 's3', 's1']);
  });

  it('moveField reorders within the same section', () => {
    useBuilderStore.setState({
      sections: [
        {
          id: 's1',
          children: [
            { id: 'a', key: 'a', type: 'text' },
            { id: 'b', key: 'b', type: 'text' },
            { id: 'c', key: 'c', type: 'text' },
          ],
        },
      ],
      selected: null,
      dirty: false,
    });
    useBuilderStore.getState().moveField('c', 'a');
    const s1 = useBuilderStore.getState().sections[0];
    expect(s1.children.map((n: any) => n.id)).toEqual(['c', 'a', 'b']);
  });

  it('moveField moves to end of another section', () => {
    useBuilderStore.setState({
      sections: [
        { id: 's1', children: [{ id: 'a', key: 'a', type: 'text' }] },
        { id: 's2', children: [{ id: 'b', key: 'b', type: 'text' }] },
      ],
      selected: null,
      dirty: false,
    });
    useBuilderStore.getState().moveField('a', null, 's2');
    const [s1, s2] = useBuilderStore.getState().sections as any[];
    expect(s1.children).toEqual([]);
    expect(s2.children.map((n: any) => n.id)).toEqual(['b', 'a']);
  });

  it('moveField does not emit builder:open-props event', () => {
    let opened = false;
    const listener = () => {
      opened = true;
    };
    window.addEventListener('builder:open-props', listener as any);

    useBuilderStore.setState({
      sections: [
        {
          id: 's1',
          children: [
            { id: 'a', key: 'a', type: 'text' },
            { id: 'b', key: 'b', type: 'text' },
          ],
        },
      ],
      selected: null,
      dirty: false,
    });

    useBuilderStore.getState().moveField('b', 'a');

    window.removeEventListener('builder:open-props', listener as any);
    expect(opened).toBe(false);
  });
});

