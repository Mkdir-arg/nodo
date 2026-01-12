import React, { useState } from 'react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';

interface CUITInputProps {
  id: string;
  label?: string;
  cuitValue?: string;
  razonSocialValue?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: FieldSize;
  onChange?: (cuit: string, razonSocial: string) => void;
}

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

export const CUITInput: React.FC<CUITInputProps> = ({
  id,
  label,
  cuitValue = '',
  razonSocialValue = '',
  required,
  disabled,
  error,
  size = 'md',
  onChange,
}) => {
  const formatCUIT = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XX-XXXXXXXX-X
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 10) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
    }
  };

  const handleCUITChange = (value: string) => {
    const formatted = formatCUIT(value);
    onChange?.(formatted, razonSocialValue);
  };

  const handleRazonSocialChange = (value: string) => {
    onChange?.(cuitValue, value);
  };

  const baseClasses = 'w-full rounded-lg border transition-all duration-200 outline-none';
  
  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900';
  
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
    : 'bg-white dark:bg-gray-900';

  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}

      <div className="space-y-3">
        <div>
          <label htmlFor={`${id}-cuit`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            CUIT
          </label>
          <input
            id={`${id}-cuit`}
            type="text"
            value={cuitValue}
            placeholder="20-12345678-9"
            maxLength={13}
            required={required}
            disabled={disabled}
            onChange={(e) => handleCUITChange(e.target.value)}
            className={`
              ${baseClasses}
              ${sizeClasses[size]}
              ${stateClasses}
              ${disabledClasses}
              text-gray-900 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
            `}
          />
        </div>

        <div>
          <label htmlFor={`${id}-razon`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Razón Social
          </label>
          <input
            id={`${id}-razon`}
            type="text"
            value={razonSocialValue}
            placeholder="Nombre de la empresa"
            required={required}
            disabled={disabled}
            onChange={(e) => handleRazonSocialChange(e.target.value)}
            className={`
              ${baseClasses}
              ${sizeClasses[size]}
              ${stateClasses}
              ${disabledClasses}
              text-gray-900 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
            `}
          />
        </div>
      </div>

      <FormError message={error} />
    </div>
  );
};
