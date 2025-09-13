import { useBuilderStore } from './usePlantillaBuilderStore';
import { describe, it, expect } from 'vitest';

describe('inserción en sección activa', () => {
  it('usa sección seleccionada', () => {
    useBuilderStore.setState({ sections:[{id:'s1',children:[]},{id:'s2',children:[]}], selected:{type:'section',id:'s1'} } as any);
    const sid = useBuilderStore.getState().getSectionIdForInsert();
    expect(sid).toBe('s1');
  });
  it('si hay campo seleccionado, usa su sección', () => {
    useBuilderStore.setState({ sections:[{id:'s1',children:[{id:'f1'}]},{id:'s2',children:[]}], selected:{type:'field',id:'f1'} } as any);
    const sid = useBuilderStore.getState().getSectionIdForInsert();
    expect(sid).toBe('s1');
  });
});
