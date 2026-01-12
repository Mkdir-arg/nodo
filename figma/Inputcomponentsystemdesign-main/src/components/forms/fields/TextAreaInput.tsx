import React from 'react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';

interface TextAreaInputProps {
  id: string;
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  size?: FieldSize;
  rows?: number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

export const TextAreaInput: React.FC<TextAreaInputProps> = ({
  id,
  label,
  value = '',
  placeholder,
  required,
  disabled,
  readonly,
  error,
  size = 'md',
  rows = 4,
  onChange,
  onBlur,
}) => {
  const baseClasses = 'w-full rounded-lg border transition-all duration-200 outline-none resize-y';
  
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
      
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${stateClasses}
          ${disabledClasses}
          ${readonlyClasses}
          text-gray-900 dark:text-gray-100
          placeholder:text-gray-400 dark:placeholder:text-gray-500
        `}
      />
      
      <FormError message={error} />
    </div>
  );
};
