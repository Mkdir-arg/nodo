import React from 'react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';
import { Palette } from 'lucide-react';

interface ColorPickerInputProps {
  id: string;
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  size?: FieldSize;
  onChange?: (value: string) => void;
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
};

const previewSizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const inputSizeClasses = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({
  id,
  label,
  value = '#000000',
  placeholder,
  required,
  disabled,
  readonly,
  error,
  size = 'md',
  onChange,
}) => {
  const baseClasses = 'rounded-lg border transition-all duration-200 outline-none';
  
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
      
      <div className="flex gap-3 items-center">
        {/* Color preview and picker */}
        <div className="relative">
          <input
            type="color"
            id={id}
            value={value}
            disabled={disabled || readonly}
            onChange={(e) => onChange?.(e.target.value)}
            className={`
              ${previewSizeClasses[size]}
              rounded-lg border-2 cursor-pointer
              ${error 
                ? 'border-red-500' 
                : 'border-gray-300 dark:border-gray-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${readonly ? 'cursor-default' : ''}
            `}
          />
          <Palette 
            className={`
              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              pointer-events-none text-white mix-blend-difference
              ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
            `}
          />
        </div>
        
        {/* Hex input */}
        <input
          type="text"
          value={value}
          placeholder={placeholder || '#000000'}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          onChange={(e) => {
            // Validate hex color format
            const hex = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(hex) || hex === '#' || hex === '') {
              onChange?.(hex);
            }
          }}
          className={`
            flex-1 font-mono uppercase
            ${baseClasses}
            ${sizeClasses[size]}
            ${inputSizeClasses[size]}
            ${stateClasses}
            ${disabledClasses}
            ${readonlyClasses}
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
          `}
        />
      </div>
      
      <FormError message={error} />
    </div>
  );
};
