import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, ArrowUp, ArrowDown, Copy } from 'lucide-react';
import type {
  ConditionBranch,
  ConditionConfig,
  ConditionOperator,
  FlowStep,
} from '@/lib/flows/types';

const OPERATORS: { value: ConditionOperator; label: string; types: string[] }[] = [
  { value: 'equals', label: '==', types: ['string', 'number'] },
  { value: 'not_equals', label: '!=', types: ['string', 'number'] },
  { value: '>', label: '>', types: ['number'] },
  { value: '>=', label: '>=', types: ['number'] },
  { value: '<', label: '<', types: ['number'] },
  { value: '<=', label: '<=', types: ['number'] },
  { value: 'contains', label: 'contiene', types: ['string'] },
];

type NormalizedConfig = ConditionConfig & {
  branches: ConditionBranch[];
  fallbackNextStepId?: string;
};

interface ConditionConfigEditorProps {
  config: ConditionConfig;
  onChange: (config: ConditionConfig) => void;
  steps: FlowStep[];
  currentStepId?: string;
}

const randomId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2, 10)}`);

export function ConditionConfigEditor({
  config,
  onChange,
  steps,
  currentStepId,
}: ConditionConfigEditorProps) {
  const normalizedConfig: NormalizedConfig = useMemo(
    () => ({
      branches: Array.isArray(config?.branches)
        ? config.branches.map((branch) => ({
            ...branch,
            logic: (branch.logic || 'AND') as 'AND' | 'OR',
            rules: Array.isArray(branch.rules) ? branch.rules : [],
          }))
        : [],
      fallbackNextStepId: config?.fallbackNextStepId,
    }),
    [config]
  );

  const availableSteps = useMemo(
    () => steps.filter((step) => step.id !== currentStepId),
    [steps, currentStepId]
  );

  const getFieldsForStep = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return [];

    if (step.type === 'form') {
      return (step.config?.fields || []).map((field: any) => ({
        value: `form|${step.id}|${field.name}`,
        label: `${step.name}: ${field.label || field.name}`,
      }));
    }

    if (step.type === 'evaluation') {
      const base = [
        { value: `evaluation|${step.id}|total_score`, label: `${step.name}: Puntaje total` },
        { value: `evaluation|${step.id}|category`, label: `${step.name}: Categoría` },
      ];

      const questions: { value: string; label: string }[] = [];

      (step.config?.questions || []).forEach((question: any) => {
        const questionLabel = question.text || question.id;
        questions.push({
          value: `evaluation_answer_score|${step.id}|${question.id}`,
          label: `${step.name}: Puntaje "${questionLabel}"`,
        });
        questions.push({
          value: `evaluation_answer_selected|${step.id}|${question.id}`,
          label: `${step.name}: Respuesta "${questionLabel}"`,
        });
      });

      return [...base, ...questions];
    }

    return [];
  };

  const updateConfig = (updater: (cfg: NormalizedConfig) => NormalizedConfig) => {
    const next = updater(normalizedConfig);
    onChange({
      branches: next.branches,
      fallbackNextStepId: next.fallbackNextStepId,
    });
  };

  const updateBranch = (branchId: string, updater: (branch: ConditionBranch) => ConditionBranch) => {
    updateConfig((cfg) => ({
      ...cfg,
      branches: cfg.branches.map((branch) =>
        branch.id === branchId ? updater(branch) : branch
      ),
    }));
  };

  const handleAddBranch = () => {
    updateConfig((cfg) => ({
      ...cfg,
      branches: [
        ...cfg.branches,
        {
          id: randomId(),
          label: `Rama ${cfg.branches.length + 1}`,
          logic: 'AND',
          rules: [],
          nextStepId: undefined,
        },
      ],
    }));
  };

  const handleRemoveBranch = (branchId: string) => {
    const branch = normalizedConfig.branches.find(b => b.id === branchId);
    const hasRules = branch?.rules && branch.rules.length > 0;
    
    if (hasRules && !confirm('Esta rama tiene reglas configuradas. ¿Estás seguro de eliminarla?')) {
      return;
    }
    
    updateConfig((cfg) => ({
      ...cfg,
      branches: cfg.branches.filter((branch) => branch.id !== branchId),
    }));
  };
  
  const handleMoveBranch = (branchId: string, direction: 'up' | 'down') => {
    updateConfig((cfg) => {
      const branches = [...cfg.branches];
      const index = branches.findIndex(b => b.id === branchId);
      if (index === -1) return cfg;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= branches.length) return cfg;
      
      [branches[index], branches[newIndex]] = [branches[newIndex], branches[index]];
      return { ...cfg, branches };
    });
  };
  
  const handleCloneBranch = (branchId: string) => {
    const branch = normalizedConfig.branches.find(b => b.id === branchId);
    if (!branch) return;
    
    updateConfig((cfg) => ({
      ...cfg,
      branches: [
        ...cfg.branches,
        {
          ...branch,
          id: randomId(),
          label: `${branch.label} (copia)`,
          nextStepId: undefined, // Reset target
        }
      ]
    }));
  };

  const handleAddRule = (branchId: string) => {
    const defaultSourceStep = availableSteps[0]?.id || '';
    const defaultField =
      defaultSourceStep ? getFieldsForStep(defaultSourceStep)[0]?.value || '' : '';

    updateBranch(branchId, (branch) => ({
      ...branch,
      rules: [
        ...(branch.rules || []),
        {
          id: randomId(),
          sourceStepId: defaultSourceStep,
          field: defaultField,
          operator: 'equals',
          value: '',
        },
      ],
    }));
  };

  const handleRemoveRule = (branchId: string, ruleId: string) => {
    updateBranch(branchId, (branch) => ({
      ...branch,
      rules: branch.rules.filter((rule) => rule.id !== ruleId),
    }));
  };

  const handleFallbackChange = (stepId: string) => {
    updateConfig((cfg) => ({
      ...cfg,
      fallbackNextStepId: stepId || undefined,
    }));
  };
  
  const getFieldType = (fieldValue: string): 'string' | 'number' => {
    if (fieldValue.includes('total_score') || fieldValue.includes('score')) {
      return 'number';
    }
    return 'string';
  };
  
  const validateBranch = (branch: ConditionBranch) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!branch.nextStepId) {
      errors.push('Falta seleccionar paso destino');
    }
    
    if (!branch.rules || branch.rules.length === 0) {
      warnings.push('No hay reglas configuradas');
    }
    
    branch.rules?.forEach((rule, idx) => {
      if (!rule.source) errors.push(`Regla ${idx + 1}: Falta fuente`);
      if (!rule.field) errors.push(`Regla ${idx + 1}: Campo vacío`);
      if (!rule.operator) errors.push(`Regla ${idx + 1}: Operador vacío`);
      if (rule.value === undefined || rule.value === '') {
        errors.push(`Regla ${idx + 1}: Valor vacío`);
      }
      
      // Validate operator compatibility
      const fieldType = getFieldType(rule.field);
      const validOps = OPERATORS.filter(op => op.types.includes(fieldType)).map(op => op.value);
      if (rule.operator && !validOps.includes(rule.operator)) {
        errors.push(`Regla ${idx + 1}: Operador incompatible con tipo de campo`);
      }
    });
    
    return { errors, warnings };
  };
  
  const validateConfig = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (normalizedConfig.branches.length === 0) {
      errors.push('Debe tener al menos una rama');
    }
    
    // Check for duplicate branch labels
    const labels = normalizedConfig.branches.map(b => b.label).filter(Boolean);
    const duplicateLabels = labels.filter((label, idx) => labels.indexOf(label) !== idx);
    if (duplicateLabels.length > 0) {
      warnings.push(`Etiquetas duplicadas: ${duplicateLabels.join(', ')}`);
    }
    
    normalizedConfig.branches.forEach((branch, idx) => {
      const branchValidation = validateBranch(branch);
      errors.push(...branchValidation.errors.map(e => `Rama ${idx + 1}: ${e}`));
      warnings.push(...branchValidation.warnings.map(w => `Rama ${idx + 1}: ${w}`));
    });
    
    if (!normalizedConfig.fallbackNextStepId) {
      warnings.push('Considera agregar una ruta alternativa');
    }
    
    return { errors, warnings, hasErrors: errors.length > 0 };
  };
  
  const configValidation = validateConfig();

  return (
    <div className="space-y-4">
      {/* Global validation feedback */}
      {configValidation.hasErrors && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Errores de configuración</span>
          </div>
          <ul className="text-sm text-red-600 space-y-1">
            {configValidation.errors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {configValidation.warnings.length > 0 && !configValidation.hasErrors && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Advertencias</span>
          </div>
          <ul className="text-sm text-yellow-600 space-y-1">
            {configValidation.warnings.map((warning, i) => (
              <li key={i}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-semibold text-gray-700">Ramas de Condición</h5>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddBranch}
          disabled={availableSteps.length === 0}
        >
          Agregar ruta
        </Button>
      </div>

      {normalizedConfig.branches.length === 0 && (
        <p className="text-sm text-gray-500">
          No hay rutas configuradas. Agrega una ruta para evaluar condiciones.
        </p>
      )}

      <div className="space-y-4">
        {normalizedConfig.branches.map((branch, branchIndex) => {
          const firstRule = branch.rules[0];
          const fieldOptions = firstRule
            ? getFieldsForStep(firstRule.sourceStepId)
            : [];
          const validation = validateBranch(branch);
          const hasErrors = validation.errors.length > 0;
          const hasWarnings = validation.warnings.length > 0;

          return (
            <div key={branch.id} className={`rounded-xl border p-4 bg-white shadow-sm space-y-3 ${
              hasErrors ? 'border-red-300 bg-red-50' : hasWarnings ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
            }`}>
              {/* Validation feedback */}
              {(hasErrors || hasWarnings) && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white border">
                  {hasErrors ? (
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  )}
                  <div className="text-sm">
                    {validation.errors.map((error, i) => (
                      <div key={i} className="text-red-600">{error}</div>
                    ))}
                    {validation.warnings.map((warning, i) => (
                      <div key={i} className="text-yellow-600">{warning}</div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <Label htmlFor={`branch-label-${branch.id}`}>Nombre de la ruta</Label>
                  <Input
                    id={`branch-label-${branch.id}`}
                    value={branch.label}
                    onChange={(e) =>
                      updateBranch(branch.id, (b) => ({ ...b, label: e.target.value }))
                    }
                    placeholder="Ej: Aprobado"
                  />
                </div>
                <div className="md:w-40">
                  <Label htmlFor={`branch-logic-${branch.id}`}>Lógica</Label>
                  <select
                    id={`branch-logic-${branch.id}`}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={branch.logic || 'AND'}
                  onChange={(e) =>
                    updateBranch(branch.id, (b) => ({
                      ...b,
                      logic: (e.target.value === 'OR' ? 'OR' : 'AND'),
                    }))
                  }
                >
                    <option value="AND">Todas las reglas</option>
                    <option value="OR">Al menos una</option>
                  </select>
                </div>
                
                {/* Branch actions */}
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveBranch(branch.id, 'up')}
                    disabled={branchIndex === 0}
                    title="Mover arriba"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveBranch(branch.id, 'down')}
                    disabled={branchIndex === normalizedConfig.branches.length - 1}
                    title="Mover abajo"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCloneBranch(branch.id)}
                    title="Clonar rama"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveBranch(branch.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {branch.rules.map((rule) => {
                  const ruleFields = getFieldsForStep(rule.sourceStepId);
                  const hasFieldOptions = ruleFields.length > 0;

                  return (
                    <div
                      key={rule.id}
                      className="grid gap-2 rounded-lg border border-gray-100 p-3 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
                    >
                      <div>
                        <Label>Fuente</Label>
                        <select
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          value={rule.sourceStepId}
                      onChange={(e) =>
                        updateBranch(branch.id, (b) => ({
                          ...b,
                          rules: b.rules.map((r) =>
                            r.id === rule.id
                              ? {
                                  ...r,
                                  sourceStepId: e.target.value,
                                  field: (() => {
                                    const options = getFieldsForStep(e.target.value);
                                    return options[0]?.value || '';
                                  })(),
                                }
                              : r
                          ),
                            }))
                          }
                        >
                          {availableSteps.length === 0 && (
                            <option value="">No hay pasos anteriores</option>
                          )}
                          {availableSteps.map((step) => (
                            <option key={step.id} value={step.id}>
                              {step.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label>Campo</Label>
                        {hasFieldOptions ? (
                          <select
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            value={rule.field}
                            onChange={(e) =>
                              updateBranch(branch.id, (b) => ({
                                ...b,
                                rules: b.rules.map((r) =>
                                  r.id === rule.id ? { ...r, field: e.target.value } : r
                                ),
                              }))
                            }
                          >
                            <option value="">Seleccionar campo…</option>
                            {(() => {
                              const options = ruleFields;
                              const existing = options.some((field) => field.value === rule.field);
                              const combined = existing
                                ? options
                                : rule.field
                                ? [...options, { value: rule.field, label: rule.field }]
                                : options;
                              return combined.map((field) => (
                                <option key={field.value} value={field.value}>
                                  {field.label}
                                </option>
                              ));
                            })()}
                          </select>
                        ) : (
                          <Input
                            value={rule.field}
                            onChange={(e) =>
                              updateBranch(branch.id, (b) => ({
                                ...b,
                                rules: b.rules.map((r) =>
                                  r.id === rule.id ? { ...r, field: e.target.value } : r
                                ),
                              }))
                            }
                            placeholder="Nombre del campo"
                          />
                        )}
                      </div>

                        <div>
                          <Label>Operador</Label>
                          <select
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            value={rule.operator}
                            onChange={(e) =>
                              updateBranch(branch.id, (b) => ({
                                ...b,
                                rules: b.rules.map((r) =>
                                  r.id === rule.id
                                    ? {
                                        ...r,
                                        operator: e.target.value as ConditionOperator,
                                      }
                                    : r
                                ),
                              }))
                            }
                          >
                            {(() => {
                              const fieldType = getFieldType(rule.field);
                              return OPERATORS.filter(op => op.types.includes(fieldType)).map((operator) => (
                                <option key={operator.value} value={operator.value}>
                                  {operator.label}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>

                      <div>
                        <Label>Valor</Label>
                        <Input
                          value={rule.value}
                          onChange={(e) =>
                            updateBranch(branch.id, (b) => ({
                              ...b,
                              rules: b.rules.map((r) =>
                                r.id === rule.id ? { ...r, value: e.target.value } : r
                              ),
                            }))
                          }
                          placeholder="Valor a comparar"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveRule(branch.id, rule.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddRule(branch.id)}
                  disabled={availableSteps.length === 0}
                >
                  Agregar condición
                </Button>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  Próximo paso
                  {branch.nextStepId ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </Label>
                <select
                  className={`w-full rounded-md border px-3 py-2 text-sm ${
                    branch.nextStepId ? 'border-green-300' : 'border-red-300'
                  }`}
                  value={branch.nextStepId || ''}
                  onChange={(e) =>
                    updateBranch(branch.id, (b) => ({
                      ...b,
                      nextStepId: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">Seleccionar paso…</option>
                  {availableSteps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`rounded-xl border border-dashed p-4 ${
        normalizedConfig.fallbackNextStepId ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
      }`}>
        <Label className="flex items-center gap-2">
          Ruta alternativa (Fallback)
          {normalizedConfig.fallbackNextStepId ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
        </Label>
        <p className="text-xs text-gray-500 mb-2">
          Paso de destino si ninguna ruta cumple con las condiciones anteriores.
        </p>
        <select
          className={`w-full rounded-md border px-3 py-2 text-sm ${
            normalizedConfig.fallbackNextStepId ? 'border-green-300' : 'border-gray-300'
          }`}
          value={normalizedConfig.fallbackNextStepId || ''}
          onChange={(e) => handleFallbackChange(e.target.value)}
        >
          <option value="">Finalizar flujo</option>
          {availableSteps.map((step) => (
            <option key={step.id} value={step.id}>
              {step.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
