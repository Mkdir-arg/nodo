import React from 'react';
import { Palette } from 'lucide-react';
import { FormLabel } from '../../FormLabel';
import { FormError } from '../../FormError';
import { FieldSize } from '@/types/form-fields';
import { 
  baseInputClasses, 
  inputSizeClasses,
  getStateClasses, 
  disabledClasses, 
  readonlyClasses,
  textClasses 
} from '../../field-styles';

interface ColorPickerFieldProps {
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

const previewSizeClasses: Record<FieldSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
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
  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      
      <div className="flex gap-3 items-center">
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
              ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${readonly ? 'cursor-default' : ''}
            `}
          />
          <Palette className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            pointer-events-none text-white mix-blend-difference
            ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
          `} />
        </div>
        
        <input
          type="text"
          value={value}
          placeholder={placeholder || '#000000'}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          onChange={(e) => {
            const hex = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(hex) || hex === '#' || hex === '') {
              onChange?.(hex);
            }
          }}
          className={`
            flex-1 font-mono uppercase
            ${baseInputClasses}
            ${inputSizeClasses[size]}
            ${getStateClasses(error)}
            ${disabledClasses(disabled)}
            ${readonlyClasses(readonly)}
            ${textClasses}
          `}
        />
      </div>
      
      <FormError message={error} />
    </div>
  );
};
