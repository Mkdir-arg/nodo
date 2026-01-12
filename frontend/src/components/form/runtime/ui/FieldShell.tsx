import { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';

interface FieldShellProps {
  fieldKey: string;
  label?: string;
  required?: boolean;
  helpText?: string;
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  readonly?: boolean;
}

export default function FieldShell({
  fieldKey,
  label,
  required,
  helpText,
  icon,
  children,
  disabled,
  readonly
}: FieldShellProps) {
  const { formState: { errors } } = useFormContext();
  const error = errors[fieldKey]?.message as string | undefined;
  const hasError = !!error;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={fieldKey}
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${readonly ? 'opacity-80' : ''}
      `}>
        {children}
      </div>

      {helpText && !hasError && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{helpText}</p>
      )}
      
      {hasError && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1.5">{error}</p>
      )}
    </div>
  );
}
