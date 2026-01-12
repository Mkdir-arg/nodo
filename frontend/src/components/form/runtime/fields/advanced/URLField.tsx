import React, { useState } from 'react';
import { Link, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
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

interface URLFieldProps {
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

export const URLField: React.FC<URLFieldProps> = ({
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

  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      
      <div className="relative">
        <Link className={`
          ${iconSizeClasses[size]}
          absolute left-3 top-1/2 transform -translate-y-1/2
          text-gray-400 dark:text-gray-500 pointer-events-none
        `} />
        
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
            ${baseInputClasses}
            ${inputSizeClasses[size]}
            ${getStateClasses(error)}
            ${disabledClasses(disabled)}
            ${readonlyClasses(readonly)}
            ${textClasses}
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
          className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          <span className="truncate max-w-full">Abrir enlace</span>
        </a>
      )}
      
      <FormError message={error} />
    </div>
  );
};
