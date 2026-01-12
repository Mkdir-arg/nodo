import React from 'react';
import { Info } from 'lucide-react';
import { FormLabel } from '../FormLabel';

interface InfoFieldProps {
  id: string;
  label?: string;
  value: string;
  variant?: 'default' | 'info' | 'warning' | 'success';
}

const variantStyles = {
  default: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300',
  info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
  success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
};

const iconStyles = {
  default: 'text-gray-400',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  success: 'text-green-500',
};

export const InfoField: React.FC<InfoFieldProps> = ({
  id,
  label,
  value,
  variant = 'default',
}) => {
  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
      
      <div className={`
        px-4 py-3 rounded-lg border flex items-start gap-3
        ${variantStyles[variant]}
      `}>
        <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyles[variant]}`} />
        <p className="text-sm leading-relaxed">{value}</p>
      </div>
    </div>
  );
};
