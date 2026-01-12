import React from 'react';
import { FormLabel } from '../../FormLabel';
import { FormError } from '../../FormError';
import { FieldSize } from '@/types/form-fields';
import * as Switch from '@radix-ui/react-switch';

interface SwitchFieldProps {
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

const containerSizeClasses: Record<FieldSize, string> = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

const descriptionSizeClasses: Record<FieldSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const SwitchField: React.FC<SwitchFieldProps> = ({
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
            <FormLabel htmlFor={id} required={required} className="mb-0">
              {label}
            </FormLabel>
          )}
          {description && (
            <p className={`${descriptionSizeClasses[size]} text-gray-600 dark:text-gray-400 mt-1`}>
              {description}
            </p>
          )}
        </div>
        
        <Switch.Root
          id={id}
          checked={value}
          onCheckedChange={onChange}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${error ? 'ring-2 ring-red-500' : ''}
          `}
        >
          <Switch.Thumb
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 
              transition duration-200 ease-in-out
              ${value ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </Switch.Root>
      </div>
      
      <FormError message={error} />
    </div>
  );
};
