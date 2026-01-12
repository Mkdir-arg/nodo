import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { FormLabel } from '../../FormLabel';
import { FormError } from '../../FormError';
import { FieldSize } from '@/types/form-fields';
import { 
  baseInputClasses, 
  inputSizeClasses, 
  iconSizeClasses,
  getStateClasses, 
  disabledClasses, 
  readonlyClasses,
  textClasses 
} from '../../field-styles';

interface CurrencyFieldProps {
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

export const CurrencyField: React.FC<CurrencyFieldProps> = ({
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
    setDisplayValue(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const sanitized = inputValue.replace(/[^\d.]/g, '');
    
    setDisplayValue(sanitized);
    
    const numValue = parseFloat(sanitized) || 0;
    if (min !== undefined && numValue < min) return;
    if (max !== undefined && numValue > max) return;
    
    onChange?.(numValue);
  };

  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      
      <div className="relative">
        <DollarSign className={`
          ${iconSizeClasses[size]}
          absolute left-3 top-1/2 transform -translate-y-1/2
          text-gray-400 dark:text-gray-500 pointer-events-none
        `} />
        
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
            ${baseInputClasses}
            ${inputSizeClasses[size]}
            ${getStateClasses(error)}
            ${disabledClasses(disabled)}
            ${readonlyClasses(readonly)}
            ${textClasses}
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
