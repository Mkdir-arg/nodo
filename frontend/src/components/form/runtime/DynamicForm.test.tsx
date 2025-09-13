import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DynamicForm from './DynamicForm';
import { describe, it, expect } from 'vitest';

const schema = { nodes: [ { type:'section', id:'s', title:'S1', children:[
  {type:'number', id:'n1', key:'n1', label:'N1'},
  {type:'number', id:'n2', key:'n2', label:'N2'},
  {type:'sum', id:'s1', key:'s1', label:'S', sources:['n1','n2']},
  {type:'text', id:'t1', key:'t1', label:'T1', condicionesOcultar:[{key:'n1', op:'eq', value:1}]}
]}]};

describe('DynamicForm', () => {
  it('sum recalculates and hides fields', async () => {
    const onSubmit = () => {};
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />);
    const n1 = screen.getByLabelText('N1') as HTMLInputElement;
    const n2 = screen.getByLabelText('N2') as HTMLInputElement;
    await userEvent.type(n1, '1');
    await userEvent.type(n2, '2');
    expect(screen.getByText('3')).toBeInTheDocument();
    // field hidden
    expect(screen.queryByLabelText('T1')).toBeNull();
  });
});
