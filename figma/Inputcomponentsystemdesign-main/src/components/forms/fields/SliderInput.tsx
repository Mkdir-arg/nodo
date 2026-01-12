import React from 'react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';
import { Slider } from '@/components/ui/slider';

interface SliderInputProps {
  id: string;
  label?: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: FieldSize;
  showValue?: boolean;
  onChange?: (value: number) => void;
}

const containerClasses = {
  sm: 'py-1',
  md: 'py-2',
  lg: 'py-3',
};

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const SliderInput: React.FC<SliderInputProps> = ({
  id,
  label,
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  required,
  disabled,
  error,
  size = 'md',
  showValue = true,
  onChange,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
        {showValue && (
          <span className={`font-medium text-gray-700 dark:text-gray-300 ${labelSizeClasses[size]}`}>
            {value}
          </span>
        )}
      </div>
      
      <div className={containerClasses[size]}>
        <Slider
          id={id}
          value={[value]}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onValueChange={(values) => onChange?.(values[0])}
          className={error ? 'accent-red-500' : ''}
        />
        
        {(min !== undefined || max !== undefined) && (
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">{min}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{max}</span>
          </div>
        )}
      </div>
      
      <FormError message={error} />
    </div>
  );
};
