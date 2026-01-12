import React from 'react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';
import { Clock } from 'lucide-react';

interface TimeInputProps {
  id: string;
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  size?: FieldSize;
  min?: string;
  max?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
};

const inputSizeClasses = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const TimeInput: React.FC<TimeInputProps> = ({
  id,
  label,
  value = '',
  placeholder,
  required,
  disabled,
  readonly,
  error,
  size = 'md',
  min,
  max,
  onChange,
  onBlur,
}) => {
  const baseClasses = 'w-full rounded-lg border transition-all duration-200 outline-none';
  
  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900';
  
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
    : 'bg-white dark:bg-gray-900';
  
  const readonlyClasses = readonly
    ? 'bg-gray-50 dark:bg-gray-800 cursor-default'
    : '';

  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      
      <div className="relative">
        <input
          id={id}
          type="time"
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          min={min}
          max={max}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          className={`
            ${baseClasses}
            ${sizeClasses[size]}
            ${inputSizeClasses[size]}
            ${stateClasses}
            ${disabledClasses}
            ${readonlyClasses}
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            pr-10
          `}
        />
        
        <Clock 
          className={`
            ${iconSizeClasses[size]}
            absolute right-3 top-1/2 transform -translate-y-1/2
            text-gray-400 dark:text-gray-500 pointer-events-none
          `}
        />
      </div>
      
      <FormError message={error} />
    </div>
  );
};
