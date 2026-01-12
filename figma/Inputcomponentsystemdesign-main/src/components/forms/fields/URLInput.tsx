import React, { useState } from 'react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';
import { Link, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

interface URLInputProps {
  id: string;
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  size?: FieldSize;
  showPreview?: boolean;
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

export const URLInput: React.FC<URLInputProps> = ({
  id,
  label,
  value = '',
  placeholder,
  required,
  disabled,
  readonly,
  error,
  size = 'md',
  showPreview = true,
  onChange,
  onBlur,
}) => {
  const [isValidURL, setIsValidURL] = useState(false);

  const validateURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (newValue: string) => {
    onChange?.(newValue);
    setIsValidURL(validateURL(newValue));
  };

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
        <Link 
          className={`
            ${iconSizeClasses[size]}
            absolute left-3 top-1/2 transform -translate-y-1/2
            text-gray-400 dark:text-gray-500 pointer-events-none
          `}
        />
        
        <input
          id={id}
          type="url"
          value={value}
          placeholder={placeholder || 'https://example.com'}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          onChange={(e) => handleChange(e.target.value)}
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
            pl-10 pr-10
          `}
        />
        
        {value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValidURL ? (
              <CheckCircle2 className={`${iconSizeClasses[size]} text-green-500`} />
            ) : (
              <AlertCircle className={`${iconSizeClasses[size]} text-red-500`} />
            )}
          </div>
        )}
      </div>
      
      {showPreview && isValidURL && value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-2 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400
            hover:text-blue-700 dark:hover:text-blue-300 transition-colors
          "
        >
          <ExternalLink className="w-3 h-3" />
          <span className="truncate max-w-full">Abrir enlace</span>
        </a>
      )}
      
      <FormError message={error} />
    </div>
  );
};
