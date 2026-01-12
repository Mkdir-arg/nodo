import React from 'react';
import { Calculator } from 'lucide-react';
import { FormLabel } from '../FormLabel';

interface SumFieldProps {
  id: string;
  label?: string;
  value: number;
}

export const SumField: React.FC<SumFieldProps> = ({
  id,
  label,
  value,
}) => {
  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
      
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          readOnly
          className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold text-right cursor-default"
        />
        <Calculator className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        Campo calculado automáticamente
      </p>
    </div>
  );
};
