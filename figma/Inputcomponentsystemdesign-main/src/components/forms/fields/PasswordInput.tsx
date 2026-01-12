import React, { useState, useEffect } from 'react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  size?: FieldSize;
  showStrength?: boolean;
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

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

const strengthColors = {
  weak: 'bg-red-500',
  fair: 'bg-orange-500',
  good: 'bg-yellow-500',
  strong: 'bg-green-500',
};

const strengthLabels = {
  weak: 'Débil',
  fair: 'Regular',
  good: 'Buena',
  strong: 'Fuerte',
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value = '',
  placeholder,
  required,
  disabled,
  readonly,
  error,
  size = 'md',
  showStrength = true,
  onChange,
  onBlur,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength>('weak');

  useEffect(() => {
    if (value) {
      setStrength(calculatePasswordStrength(value));
    }
  }, [value]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    
    if (score <= 1) return 'weak';
    if (score === 2) return 'fair';
    if (score === 3) return 'good';
    return 'strong';
  };

  const getStrengthWidth = (): string => {
    switch (strength) {
      case 'weak': return 'w-1/4';
      case 'fair': return 'w-2/4';
      case 'good': return 'w-3/4';
      case 'strong': return 'w-full';
    }
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
        <Lock 
          className={`
            ${iconSizeClasses[size]}
            absolute left-3 top-1/2 transform -translate-y-1/2
            text-gray-400 dark:text-gray-500 pointer-events-none
          `}
        />
        
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          onChange={(e) => onChange?.(e.target.value)}
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
        
        {!readonly && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2
              text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300
              transition-colors focus:outline-none
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {showPassword ? (
              <EyeOff className={iconSizeClasses[size]} />
            ) : (
              <Eye className={iconSizeClasses[size]} />
            )}
          </button>
        )}
      </div>
      
      {showStrength && value && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Fortaleza de contraseña
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {strengthLabels[strength]}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strengthColors[strength]} ${getStrengthWidth()}`}
            />
          </div>
        </div>
      )}
      
      <FormError message={error} />
    </div>
  );
};
