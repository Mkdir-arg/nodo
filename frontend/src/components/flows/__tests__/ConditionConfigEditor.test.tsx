import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConditionConfigEditor } from '../ConditionConfigEditor';
import type { ConditionConfig, FlowStep } from '@/lib/flows/types';

// Mock jest functions
const mockFn = () => {
  const calls: any[][] = [];
  const fn = (...args: any[]) => {
    calls.push(args);
  };
  fn.mock = { calls };
  return fn;
};

global.jest = {
  fn: mockFn
} as any;

const mockSteps: FlowStep[] = [
  {
    id: 'form1',
    type: 'form',
    name: 'User Form',
    config: {
      fields: [
        { name: 'age', type: 'number', label: 'Age' },
        { name: 'name', type: 'text', label: 'Name' }
      ]
    }
  },
  {
    id: 'eval1',
    type: 'evaluation',
    name: 'Score Evaluation',
    config: {
      questions: [
        {
          id: 'q1',
          text: 'Rate service',
          type: 'single_choice',
          options: [
            { id: 'good', text: 'Good', score: 5 },
            { id: 'bad', text: 'Bad', score: 1 }
          ]
        }
      ]
    }
  },
  {
    id: 'target1',
    type: 'form',
    name: 'Target Form'
  }
];

describe('ConditionConfigEditor', () => {
  const defaultConfig: ConditionConfig = {
    branches: [],
    fallbackNextStepId: undefined
  };

  it('shows validation errors for empty configuration', () => {
    const onChange = jest.fn();
    
    render(
      <ConditionConfigEditor
        config={defaultConfig}
        onChange={onChange}
        steps={mockSteps}
        currentStepId="cond1"
      />
    );

    expect(screen.getByText(/Debe tener al menos una rama/)).toBeInTheDocument();
  });

  it('allows adding and configuring branches', async () => {
    const onChange = jest.fn();
    
    render(
      <ConditionConfigEditor
        config={defaultConfig}
        onChange={onChange}
        steps={mockSteps}
        currentStepId="cond1"
      />
    );

    // Add branch
    fireEvent.click(screen.getByText('Agregar ruta'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          branches: expect.arrayContaining([
            expect.objectContaining({
              label: 'Rama 1',
              logic: 'AND',
              rules: []
            })
          ])
        })
      );
    });
  });

  it('validates rule configuration', () => {
    const configWithBranch: ConditionConfig = {
      branches: [
        {
          id: 'branch1',
          label: 'Test Branch',
          logic: 'AND',
          rules: [
            {
              id: 'rule1',
              source: '', // Missing source
              field: '',
              operator: 'equals',
              value: ''
            }
          ],
          nextStepId: undefined
        }
      ]
    };

    render(
      <ConditionConfigEditor
        config={configWithBranch}
        onChange={jest.fn()}
        steps={mockSteps}
        currentStepId="cond1"
      />
    );

    expect(screen.getByText(/Falta fuente/)).toBeInTheDocument();
    expect(screen.getByText(/Campo vacío/)).toBeInTheDocument();
    expect(screen.getByText(/Valor vacío/)).toBeInTheDocument();
  });

  it('shows operator compatibility validation', () => {
    const configWithIncompatibleOperator: ConditionConfig = {
      branches: [
        {
          id: 'branch1',
          label: 'Test Branch',
          logic: 'AND',
          rules: [
            {
              id: 'rule1',
              source: 'form',
              field: 'form|form1|name', // String field
              operator: '>', // Numeric operator on string field
              value: 'test'
            }
          ],
          nextStepId: 'target1'
        }
      ]
    };

    render(
      <ConditionConfigEditor
        config={configWithIncompatibleOperator}
        onChange={jest.fn()}
        steps={mockSteps}
        currentStepId="cond1"
      />
    );

    expect(screen.getByText(/Operador incompatible/)).toBeInTheDocument();
  });

  it('allows branch management operations', async () => {
    const onChange = jest.fn();
    const configWithBranches: ConditionConfig = {
      branches: [
        {
          id: 'branch1',
          label: 'Branch 1',
          logic: 'AND',
          rules: [],
          nextStepId: 'target1'
        },
        {
          id: 'branch2',
          label: 'Branch 2',
          logic: 'OR',
          rules: [],
          nextStepId: 'target1'
        }
      ]
    };

    render(
      <ConditionConfigEditor
        config={configWithBranches}
        onChange={onChange}
        steps={mockSteps}
        currentStepId="cond1"
      />
    );

    // Test clone branch
    const cloneButtons = screen.getAllByTitle('Clonar rama');
    fireEvent.click(cloneButtons[0]);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          branches: expect.arrayContaining([
            expect.objectContaining({ label: 'Branch 1 (copia)' })
          ])
        })
      );
    });
  });

  it('validates fallback configuration', () => {
    const configWithFallback: ConditionConfig = {
      branches: [
        {
          id: 'branch1',
          label: 'Test Branch',
          logic: 'AND',
          rules: [],
          nextStepId: 'target1'
        }
      ],
      fallbackNextStepId: 'target1'
    };

    render(
      <ConditionConfigEditor
        config={configWithFallback}
        onChange={jest.fn()}
        steps={mockSteps}
        currentStepId="cond1"
      />
    );

    // Should show green checkmark for configured fallback
    expect(screen.getByTitle(/CheckCircle/)).toBeInTheDocument();
  });
});