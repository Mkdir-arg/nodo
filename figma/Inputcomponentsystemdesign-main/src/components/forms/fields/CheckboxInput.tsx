import React from 'react';
import { Check } from 'lucide-react';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';

interface CheckboxInputProps {
  id: string;
  label?: string;
  value?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: FieldSize;
  onChange?: (value: boolean) => void;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  id,
  label,
  value = false,
  required,
  disabled,
  error,
  size = 'md',
  onChange,
}) => {
  return (
    <div className="w-full">
      <label
        className={`
          flex items-start gap-3 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="relative flex items-center pt-0.5">
          <input
            id={id}
            type="checkbox"
            checked={value}
            required={required}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`
              ${sizeClasses[size]}
              rounded border-2 transition-all duration-200 flex items-center justify-center
              ${value 
                ? 'bg-blue-500 border-blue-500' 
                : error
                  ? 'bg-white dark:bg-gray-900 border-red-500'
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
              }
            `}
          >
            {value && <Check className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-white`} />}
          </div>
        </div>
        
        {label && (
          <span className={`
            flex-1 select-none ${textSizeClasses[size]}
            ${value ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}
          `}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        )}
      </label>
      
      <FormError message={error} />
    </div>
  );
};
