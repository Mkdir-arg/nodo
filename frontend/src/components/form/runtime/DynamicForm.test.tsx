import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import DynamicForm from './DynamicForm';
import { describe, it, expect, vi, afterEach } from 'vitest';

const sumSchema = { nodes: [ { type:'section', id:'s', title:'S1', children:[
  {type:'number', id:'n1', key:'n1', label:'N1'},
  {type:'number', id:'n2', key:'n2', label:'N2'},
  {type:'sum', id:'s1', key:'s1', label:'S', sources:['n1','n2']},
  {type:'text', id:'t1', key:'t1', label:'T1', condicionesOcultar:[{key:'n1', op:'eq', value:1}]}
]}]};

const fieldsSchema = {
  nodes: [
    {
      type: 'section',
      id: 'sec-basic',
      title: 'Datos básicos',
      children: [
        { type: 'text', id: 'txt', key: 'nombre', label: 'Nombre', required: true },
        { type: 'number', id: 'num', key: 'edad', label: 'Edad', required: true },
        {
          type: 'select',
          id: 'sel',
          key: 'color',
          label: 'Color favorito',
          required: true,
          placeholder: 'Elegí un color',
          options: [
            { value: 'rojo', label: 'Rojo' },
            { value: 'azul', label: 'Azul' },
          ],
        },
      ],
    },
  ],
};

describe('DynamicForm', () => {
  afterEach(() => {
    cleanup();
  });

  it('sum recalculates and hides fields', async () => {
    const onSubmit = () => {};
    render(<DynamicForm schema={sumSchema} onSubmit={onSubmit} />);
    const n1 = screen.getByLabelText('N1') as HTMLInputElement;
    const n2 = screen.getByLabelText('N2') as HTMLInputElement;
    fireEvent.change(n1, { target: { value: '1' } });
    fireEvent.change(n2, { target: { value: '2' } });
    expect(screen.getByText('3')).toBeInTheDocument();
    // field hidden
    expect(screen.queryByLabelText('T1')).toBeNull();
  });

  it('renders text, number and select fields', () => {
    const onSubmit = () => {};
    render(<DynamicForm schema={fieldsSchema} onSubmit={onSubmit} />);

    const textInput = screen.getByLabelText('Nombre');
    const numberInput = screen.getByLabelText('Edad');
    const selectInput = screen.getByLabelText('Color favorito');

    expect(textInput).toBeInTheDocument();
    expect(numberInput).toHaveAttribute('type', 'number');
    expect(selectInput.tagName).toBe('SELECT');
  });

  it('calls onSubmit with form values when validation passes', async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm schema={fieldsSchema} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('Edad'), { target: { value: '34' } });
    fireEvent.change(screen.getByLabelText('Color favorito'), { target: { value: 'azul' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const [submitted] = onSubmit.mock.calls[0];
    expect(submitted).toMatchObject({ nombre: 'Ada', edad: 34, color: 'azul' });
  });

  it('does not call submit handler when validation fails', async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm schema={fieldsSchema} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
