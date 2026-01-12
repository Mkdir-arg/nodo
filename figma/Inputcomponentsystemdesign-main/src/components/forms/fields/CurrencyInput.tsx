import React, { useState, useEffect } from 'react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';
import { DollarSign } from 'lucide-react';

interface CurrencyInputProps {
  id: string;
  label?: string;
  value?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  size?: FieldSize;
  currency?: string;
  locale?: string;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
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

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  value = 0,
  placeholder,
  required,
  disabled,
  readonly,
  error,
  size = 'md',
  currency = 'USD',
  locale = 'en-US',
  min,
  max,
  onChange,
  onBlur,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      // Format as currency when not focused
      const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      setDisplayValue(formatted);
    }
  }, [value, currency, locale, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused
    setDisplayValue(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow only numbers and decimal point
    const sanitized = inputValue.replace(/[^\d.]/g, '');
    
    setDisplayValue(sanitized);
    
    const numValue = parseFloat(sanitized) || 0;
    if (min !== undefined && numValue < min) return;
    if (max !== undefined && numValue > max) return;
    
    onChange?.(numValue);
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
        <DollarSign 
          className={`
            ${iconSizeClasses[size]}
            absolute left-3 top-1/2 transform -translate-y-1/2
            text-gray-400 dark:text-gray-500 pointer-events-none
          `}
        />
        
        <input
          id={id}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            ${baseClasses}
            ${sizeClasses[size]}
            ${inputSizeClasses[size]}
            ${stateClasses}
            ${disabledClasses}
            ${readonlyClasses}
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            pl-10
          `}
        />
      </div>
      
      {(min !== undefined || max !== undefined) && (
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          {min !== undefined && <span>Min: {new Intl.NumberFormat(locale, { style: 'currency', currency }).format(min)}</span>}
          {max !== undefined && <span>Max: {new Intl.NumberFormat(locale, { style: 'currency', currency }).format(max)}</span>}
        </div>
      )}
      
      <FormError message={error} />
    </div>
  );
};
