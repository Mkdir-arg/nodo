import React from 'react';
import { Clock } from 'lucide-react';
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

interface TimeFieldProps {
  id: string;
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  size?: FieldSize;
  min?: string;
  max?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const TimeField: React.FC<TimeFieldProps> = ({
  id,
  label,
  value = '',
  placeholder,
  required,
  disabled,
  readonly,
  error,
  size = 'md',
  min,
  max,
  onChange,
  onBlur,
}) => {
  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      
      <div className="relative">
        <input
          id={id}
          type="time"
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          min={min}
          max={max}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          className={`
            ${baseInputClasses}
            ${inputSizeClasses[size]}
            ${getStateClasses(error)}
            ${disabledClasses(disabled)}
            ${readonlyClasses(readonly)}
            ${textClasses}
            pr-10
          `}
        />
        
        <Clock className={`
          ${iconSizeClasses[size]}
          absolute right-3 top-1/2 transform -translate-y-1/2
          text-gray-400 dark:text-gray-500 pointer-events-none
        `} />
      </div>
      
      <FormError message={error} />
    </div>
  );
};
