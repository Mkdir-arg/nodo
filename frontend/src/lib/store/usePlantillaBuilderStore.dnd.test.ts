import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from './usePlantillaBuilderStore';

describe('DnD moves', () => {
  beforeEach(() => {
    useBuilderStore.setState({ sections: [], selected: null, dirty: false });
  });

  it('moveSection reorders sections', () => {
    useBuilderStore.setState({ sections: [{id:'s1',children:[]},{id:'s2',children:[]}], selected:null, dirty:false });
    useBuilderStore.getState().moveSection('s2','s1');
    expect(useBuilderStore.getState().sections.map(s=>s.id)).toEqual(['s2','s1']);
  });

  it('moveField moves across sections before over field', () => {
    useBuilderStore.setState({
      sections: [
        {id:'s1', children:[{id:'a',key:'a',type:'text'},{id:'b',key:'b',type:'text'}]},
        {id:'s2', children:[{id:'c',key:'c',type:'text'}]},
      ],
      selected:null, dirty:false
    });
    useBuilderStore.getState().moveField('a', 'c');
    const [s1,s2] = useBuilderStore.getState().sections as any[];
    expect(s1.children.map((n:any)=>n.id)).toEqual(['b']);
    expect(s2.children.map((n:any)=>n.id)).toEqual(['a','c']);
  });

  it('moveField with toSectionId inserts at end', () => {
    useBuilderStore.setState({
      sections: [
        {id:'s1', children:[{id:'a',key:'a',type:'text'}]},
        {id:'s2', children:[{id:'b',key:'b',type:'text'}]},
      ],
      selected:null, dirty:false
    });
    useBuilderStore.getState().moveField('a', null, 's2');
    const [,s2] = useBuilderStore.getState().sections as any[];
    expect(s2.children.map((n:any)=>n.id)).toEqual(['b','a']);
  });

  it('moveField does not lose or duplicate fields', () => {
    useBuilderStore.setState({
      sections: [
        {id:'s1', children:[{id:'a',key:'a',type:'text'},{id:'b',key:'b',type:'text'}]},
        {id:'s2', children:[{id:'c',key:'c',type:'text'}]},
      ],
      selected:null, dirty:false
    });
    useBuilderStore.getState().moveField('a', 'c');
    const ids = useBuilderStore.getState().sections.flatMap((s:any)=>s.children.map((n:any)=>n.id));
    expect(ids.sort()).toEqual(['a','b','c']);
  });

  it('moveField updates selected and dirty', () => {
    useBuilderStore.setState({
      sections: [
        {id:'s1', children:[{id:'a',key:'a',type:'text'}]},
        {id:'s2', children:[{id:'b',key:'b',type:'text'}]},
      ],
      selected:null, dirty:false
    });
    useBuilderStore.getState().moveField('a', null, 's2');
    const st = useBuilderStore.getState();
    expect(st.dirty).toBe(true);
    expect(st.selected).toEqual({type:'field', id:'a'});
  });
});
