import React from 'react';
import { ChevronDown } from 'lucide-react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize, SelectOption } from '@/types/form';

interface SelectInputProps {
  id: string;
  label?: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: FieldSize;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

export const SelectInput: React.FC<SelectInputProps> = ({
  id,
  label,
  value = '',
  options,
  placeholder = 'Seleccionar...',
  required,
  disabled,
  error,
  size = 'md',
  onChange,
  onBlur,
}) => {
  const baseClasses = 'w-full rounded-lg border transition-all duration-200 outline-none appearance-none';
  
  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900';
  
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
    : 'bg-white dark:bg-gray-900 cursor-pointer';

  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      
      <div className="relative">
        <select
          id={id}
          value={value}
          required={required}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          className={`
            ${baseClasses}
            ${sizeClasses[size]}
            ${stateClasses}
            ${disabledClasses}
            text-gray-900 dark:text-gray-100
            pr-10
          `}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
        />
      </div>
      
      <FormError message={error} />
    </div>
  );
};
