import React from 'react';
import { FormLabel } from '../../FormLabel';
import { FormError } from '../../FormError';
import { FieldSize } from '@/types/form-fields';
import * as Slider from '@radix-ui/react-slider';

interface SliderFieldProps {
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

const containerClasses: Record<FieldSize, string> = {
  sm: 'py-1',
  md: 'py-2',
  lg: 'py-3',
};

const labelSizeClasses: Record<FieldSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const SliderField: React.FC<SliderFieldProps> = ({
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
        <Slider.Root
          id={id}
          value={[value]}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onValueChange={(values) => onChange?.(values[0])}
          className={`relative flex items-center select-none touch-none w-full h-5 ${error ? 'opacity-75' : ''}`}
        >
          <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className={`
              block w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md
              hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : ''}
            `}
          />
        </Slider.Root>
        
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
