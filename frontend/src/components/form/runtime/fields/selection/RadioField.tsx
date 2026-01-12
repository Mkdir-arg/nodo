import React from 'react';
import { FormLabel } from '../../FormLabel';
import { FormError } from '../../FormError';
import { FieldSize, SelectOption } from '@/types/form-fields';

interface RadioFieldProps {
  id: string;
  label?: string;
  value?: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: FieldSize;
  onChange?: (value: string) => void;
}

const sizeClasses: Record<FieldSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const textSizeClasses: Record<FieldSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const RadioField: React.FC<RadioFieldProps> = ({
  id,
  label,
  value,
  options,
  required,
  disabled,
  error,
  size = 'md',
  onChange,
}) => {
  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      
      <div className={`space-y-2 ${textSizeClasses[size]}`}>
        {options.map((option) => {
          const isChecked = value === option.value;
          
          return (
            <label
              key={option.value}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer
                ${isChecked 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-600' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${error ? 'border-red-500' : ''}
              `}
            >
              <div className="relative flex items-center">
                <input
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={isChecked}
                  required={required}
                  disabled={disabled}
                  onChange={() => onChange?.(option.value)}
                  className="sr-only"
                />
                <div className={`
                  ${sizeClasses[size]}
                  rounded-full border-2 transition-all duration-200 flex items-center justify-center
                  ${isChecked ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'}
                `}>
                  {isChecked && (
                    <div className={`
                      ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'}
                      rounded-full bg-blue-500
                    `} />
                  )}
                </div>
              </div>
              
              <span className={`
                flex-1 select-none
                ${isChecked ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}
              `}>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      
      <FormError message={error} />
    </div>
  );
};
