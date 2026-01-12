import React from 'react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';
import { Switch } from '@/components/ui/switch';

interface SwitchInputProps {
  id: string;
  label?: string;
  description?: string;
  value?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: FieldSize;
  onChange?: (value: boolean) => void;
}

const containerSizeClasses = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

const descriptionSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const SwitchInput: React.FC<SwitchInputProps> = ({
  id,
  label,
  description,
  value = false,
  required,
  disabled,
  error,
  size = 'md',
  onChange,
}) => {
  return (
    <div className="w-full">
      <div className={`flex items-start justify-between ${containerSizeClasses[size]}`}>
        <div className="flex-1">
          {label && (
            <FormLabel 
              htmlFor={id} 
              required={required}
              className="mb-0"
            >
              {label}
            </FormLabel>
          )}
          {description && (
            <p className={`
              ${descriptionSizeClasses[size]}
              text-gray-600 dark:text-gray-400 mt-1
            `}>
              {description}
            </p>
          )}
        </div>
        
        <Switch
          id={id}
          checked={value}
          onCheckedChange={onChange}
          disabled={disabled}
          className={error ? 'border-red-500' : ''}
        />
      </div>
      
      <FormError message={error} />
    </div>
  );
};
