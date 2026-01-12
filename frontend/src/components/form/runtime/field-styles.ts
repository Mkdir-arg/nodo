import { FieldSize } from '@/types/form-fields';

// Clases de tamaño para inputs
export const inputSizeClasses: Record<FieldSize, string> = {
  sm: 'px-2.5 py-1.5 text-sm h-8',
  md: 'px-3 py-2 text-base h-10',
  lg: 'px-4 py-3 text-lg h-12',
};

// Clases de tamaño para iconos
export const iconSizeClasses: Record<FieldSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

// Clases de tamaño para texto
export const textSizeClasses: Record<FieldSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

// Clases base para inputs
export const baseInputClasses = 'w-full rounded-lg border transition-all duration-200 outline-none';

// Clases de estado para inputs
export const getStateClasses = (error?: string) => 
  error
    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900';

// Clases de disabled
export const disabledClasses = (disabled?: boolean) =>
  disabled
    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
    : 'bg-white dark:bg-gray-900';

// Clases de readonly
export const readonlyClasses = (readonly?: boolean) =>
  readonly
    ? 'bg-gray-50 dark:bg-gray-800 cursor-default'
    : '';

// Clases de texto
export const textClasses = 'text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500';
