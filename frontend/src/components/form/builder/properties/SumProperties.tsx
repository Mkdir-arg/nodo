'use client';

import { useState } from 'react';

interface SumPropertiesProps {
  node: any;
  numKeys: string[];
  onUpdate: (updates: any) => void;
}

export default function SumProperties({ node, numKeys, onUpdate }: SumPropertiesProps) {
  const mode = node.calculationMode || 'sum';
  const [showFormulaHelp, setShowFormulaHelp] = useState(false);

  return (
    <div className="space-y-3">
      {/* Modo de cálculo */}
      <div>
        <label className="text-sm font-medium block mb-2">Modo de Cálculo</label>
        <select 
          className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700"
          value={mode}
          onChange={e => onUpdate({ calculationMode: e.target.value })}
        >
          <option value="sum">Suma Simple</option>
          <option value="formula">Fórmula Personalizada</option>
          <option value="count">Conteo de Registros (COUNT)</option>
        </select>
      </div>

      {/* Campos fuente */}
      {(mode === 'sum' || mode === 'formula') && (
        <div>
          <div className="text-sm font-medium mb-2">Campos Fuente</div>
          <div className="flex flex-wrap gap-2">
            {numKeys.length === 0 ? (
              <p className="text-xs text-gray-500">No hay campos numéricos disponibles</p>
            ) : (
              numKeys.map(k => {
                const active = (node.sources || []).includes(k);
                return (
                  <button 
                    key={k} 
                    type="button"
                    className={`px-2 py-1 border rounded text-xs transition-colors ${
                      active 
                        ? 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-600' 
                        : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                    } dark:border-slate-700`}
                    onClick={() => {
                      const set = new Set(node.sources || []);
                      if (active) set.delete(k); 
                      else set.add(k);
                      onUpdate({ sources: Array.from(set) });
                    }}
                  >
                    {k}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Fórmula personalizada */}
      {mode === 'formula' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Fórmula</label>
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline"
              onClick={() => setShowFormulaHelp(!showFormulaHelp)}
            >
              {showFormulaHelp ? 'Ocultar ayuda' : 'Ver ayuda'}
            </button>
          </div>
          <textarea
            className="w-full border rounded-lg p-2 font-mono text-sm dark:bg-slate-900 dark:border-slate-700"
            rows={3}
            placeholder="({campo1} + {campo2}) * 1.21"
            value={node.formula || ''}
            onChange={e => onUpdate({ formula: e.target.value })}
          />
          {showFormulaHelp && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs space-y-1">
              <p className="font-medium">Operadores: + - * / ( )</p>
              <p>Usa {'{'}campo{'}'} para referenciar campos</p>
              <p className="font-medium mt-2">Ejemplos:</p>
              <code className="block">({'{'}subtotal{'}'} - {'{'}descuento{'}'}) * 1.21</code>
              <code className="block">({'{'}nota1{'}'} + {'{'}nota2{'}'}) / 2</code>
            </div>
          )}
        </div>
      )}

      {/* Configuración de COUNT */}
      {mode === 'count' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-2">Tabla</label>
            <select
              className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700"
              value={node.countConfig?.table || ''}
              onChange={e => onUpdate({ 
                countConfig: { 
                  ...(node.countConfig || {}), 
                  table: e.target.value 
                }
              })}
            >
              <option value="">Seleccionar tabla...</option>
              <option value="legajos">Legajos</option>
              <option value="personas">Personas</option>
              <option value="documentos">Documentos</option>
              <option value="relaciones">Relaciones</option>
            </select>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Filtros</div>
            {(node.countConfig?.filters || []).map((filter: any, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  className="border rounded-lg p-2 flex-1 text-sm dark:bg-slate-900 dark:border-slate-700"
                  placeholder="Columna BD"
                  value={filter.column || ''}
                  onChange={e => {
                    const filters = [...(node.countConfig?.filters || [])];
                    filters[i] = { ...filter, column: e.target.value };
                    onUpdate({ 
                      countConfig: { 
                        ...(node.countConfig || {}), 
                        filters 
                      }
                    });
                  }}
                />
                <input
                  className="border rounded-lg p-2 flex-1 text-sm dark:bg-slate-900 dark:border-slate-700"
                  placeholder="Campo formulario"
                  value={filter.sourceField || ''}
                  onChange={e => {
                    const filters = [...(node.countConfig?.filters || [])];
                    filters[i] = { ...filter, sourceField: e.target.value };
                    onUpdate({ 
                      countConfig: { 
                        ...(node.countConfig || {}), 
                        filters 
                      }
                    });
                  }}
                />
                <button
                  type="button"
                  className="px-2 border rounded-lg hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-900/20"
                  onClick={() => {
                    const filters = [...(node.countConfig?.filters || [])];
                    filters.splice(i, 1);
                    onUpdate({ 
                      countConfig: { 
                        ...(node.countConfig || {}), 
                        filters 
                      }
                    });
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
              onClick={() => {
                const filters = [
                  ...(node.countConfig?.filters || []),
                  { column: '', sourceField: '' }
                ];
                onUpdate({ 
                  countConfig: { 
                    ...(node.countConfig || {}), 
                    filters 
                  }
                });
              }}
            >
              + Agregar filtro
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Los filtros permiten contar solo registros que cumplan condiciones
            </p>
          </div>
        </div>
      )}

      {/* Formato de salida */}
      <div>
        <label className="text-sm font-medium block mb-2">Formato</label>
        <select
          className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700"
          value={node.format || 'number'}
          onChange={e => onUpdate({ format: e.target.value })}
        >
          <option value="number">Número</option>
          <option value="currency">Moneda</option>
          <option value="percentage">Porcentaje</option>
        </select>
      </div>

      {/* Opciones de moneda */}
      {node.format === 'currency' && (
        <>
          <div>
            <label className="text-sm font-medium block mb-2">Moneda</label>
            <select
              className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700"
              value={node.currency || 'ARS'}
              onChange={e => onUpdate({ currency: e.target.value })}
            >
              <option value="ARS">ARS - Peso Argentino</option>
              <option value="USD">USD - Dólar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="MXN">MXN - Peso Mexicano</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Locale</label>
            <input
              className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700"
              value={node.locale || 'es-AR'}
              onChange={e => onUpdate({ locale: e.target.value })}
              placeholder="es-AR"
            />
          </div>
        </>
      )}

      {/* Decimales */}
      <div>
        <label className="text-sm font-medium block mb-2">Decimales</label>
        <input
          type="number"
          className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700"
          value={node.decimals ?? 2}
          min={0}
          max={10}
          onChange={e => onUpdate({ decimals: Number(e.target.value) })}
        />
      </div>

      {/* Etiqueta del resultado */}
      <div>
        <label className="text-sm font-medium block mb-2">Etiqueta del Resultado</label>
        <input
          className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700"
          value={node.resultLabel || ''}
          onChange={e => onUpdate({ resultLabel: e.target.value })}
          placeholder="Total"
        />
      </div>

      {/* Texto de ayuda */}
      <div>
        <label className="text-sm font-medium block mb-2">Texto de Ayuda</label>
        <input
          className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700"
          value={node.help || ''}
          onChange={e => onUpdate({ help: e.target.value })}
          placeholder="Información adicional..."
        />
      </div>
    </div>
  );
}
