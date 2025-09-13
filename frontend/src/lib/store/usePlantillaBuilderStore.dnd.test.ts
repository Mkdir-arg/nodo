import { describe, it, expect } from 'vitest';
import { useBuilderStore } from './usePlantillaBuilderStore';

describe('DnD moves', () => {
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
    useBuilderStore.getState().moveField('a', 'c'); // mover 'a' antes de 'c' en s2
    const [s1,s2] = useBuilderStore.getState().sections as any[];
    expect(s1.children.map((n:any)=>n.id)).toEqual(['b']);
    expect(s2.children.map((n:any)=>n.id)).toEqual(['a','c']);
  });
});
