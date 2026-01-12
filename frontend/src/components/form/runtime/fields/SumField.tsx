import { useFormContext, useWatch } from "react-hook-form";
import { Calculator, Database } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SumField({ field }:{field:any}) {
  const { control } = useFormContext();
  const mode = field.calculationMode || 'sum'; // 'sum' | 'formula' | 'count'
  const [countValue, setCountValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Para modo sum y formula
  const watchedFields = useWatch({ control, name: field.sources || [] });
  
  // Calcular valor según el modo
  let displayValue = 0;
  let formattedValue = '0';
  
  if (mode === 'count') {
    // Modo conteo de registros
    displayValue = countValue ?? 0;
    formattedValue = displayValue.toString();
    
    // Fetch count from API
    useEffect(() => {
      if (!field.countConfig?.table) return;
      
      const fetchCount = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          params.append('table', field.countConfig.table);
          
          // Agregar filtros si existen
          if (field.countConfig.filters) {
            field.countConfig.filters.forEach((filter: any) => {
              const fieldValue = watchedFields[field.sources?.indexOf(filter.sourceField)];
              if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                params.append(`filter_${filter.column}`, fieldValue);
              }
            });
          }
          
          const response = await fetch(`/api/calculated-fields/count?${params}`);
          const data = await response.json();
          setCountValue(data.count || 0);
        } catch (error) {
          console.error('Error fetching count:', error);
          setCountValue(0);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCount();
    }, [field.countConfig, watchedFields]);
    
  } else if (mode === 'formula') {
    // Modo fórmula personalizada
    try {
      let formula = field.formula || '0';
      
      // Reemplazar referencias a campos con sus valores
      (field.sources || []).forEach((key: string, index: number) => {
        const value = parseFloat(watchedFields[index] || 0);
        const safeValue = isNaN(value) ? 0 : value;
        formula = formula.replace(new RegExp(`\\{${key}\\}`, 'g'), safeValue.toString());
      });
      
      // Evaluar fórmula de forma segura
      displayValue = Function('"use strict"; return (' + formula + ')')();
      if (isNaN(displayValue)) displayValue = 0;
    } catch (error) {
      console.error('Error evaluating formula:', error);
      displayValue = 0;
    }
    
  } else {
    // Modo suma simple (default)
    displayValue = (field.sources || []).reduce((acc: number, key: string, index: number) => {
      const v = parseFloat(watchedFields[index] || 0);
      return acc + (isNaN(v) ? 0 : v);
    }, 0);
  }
  
  // Formatear según configuración
  const format = field.format || 'number'; // 'number' | 'currency' | 'percentage'
  const decimals = field.decimals ?? 2;
  
  if (format === 'currency') {
    const currency = field.currency || 'ARS';
    const locale = field.locale || 'es-AR';
    formattedValue = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(displayValue);
  } else if (format === 'percentage') {
    formattedValue = `${displayValue.toFixed(decimals)}%`;
  } else {
    formattedValue = displayValue.toFixed(decimals);
  }
  
  const icon = mode === 'count' ? <Database size={16} /> : <Calculator size={16} />;
  const bgColor = mode === 'count' 
    ? 'from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/50'
    : 'from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-700/50';
  const textColor = mode === 'count'
    ? 'text-blue-700 dark:text-blue-300'
    : 'text-emerald-700 dark:text-emerald-300';
  const valueColor = mode === 'count'
    ? 'text-blue-900 dark:text-blue-100'
    : 'text-emerald-900 dark:text-emerald-100';
  
  return (
    <div className="w-full">
      {field.label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">
          {field.label}
        </label>
      )}
      <div className={`
        p-4 rounded-lg
        bg-gradient-to-br ${bgColor}
        backdrop-blur-md
        border
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className={`text-sm font-medium ${textColor}`}>
              {mode === 'count' ? 'Total de registros' : field.resultLabel || 'Total'}
            </span>
          </div>
          <span className={`text-2xl font-bold ${valueColor}`}>
            {loading ? '...' : formattedValue}
          </span>
        </div>
        {field.help && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{field.help}</p>
        )}
      </div>
    </div>
  );
}
