import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize, SelectOption } from '@/types/form';

interface MultiSelectInputProps {
  id: string;
  label?: string;
  value?: string[];
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: FieldSize;
  onChange?: (value: string[]) => void;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
  id,
  label,
  value = [],
  options,
  required,
  disabled,
  error,
  size = 'md',
  onChange,
}) => {
  const handleToggle = (optionValue: string) => {
    if (disabled) return;
    
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    onChange?.(newValue);
  };

  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      
      <div className={`space-y-2 ${sizeClasses[size]}`}>
        {options.map((option) => {
          const isChecked = value.includes(option.value);
          
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
                  type="checkbox"
                  checked={isChecked}
                  disabled={disabled}
                  onChange={() => handleToggle(option.value)}
                  className="sr-only"
                />
                <div
                  className={`
                    w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
                    ${isChecked 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                    }
                  `}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
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
