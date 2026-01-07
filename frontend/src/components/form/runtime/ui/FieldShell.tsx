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
    <div className="space-y-2.5">
      {label && (
        <label 
          htmlFor={fieldKey}
          className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100"
        >
          {icon && (
            <span className="
              flex items-center justify-center w-7 h-7 rounded-lg
              bg-gradient-to-br from-blue-500 to-purple-600
              text-white shadow-lg shadow-blue-500/30
            ">
              {icon}
            </span>
          )}
          <span>{label}</span>
          {required && <span className="text-red-500 text-base">*</span>}
        </label>
      )}
      
      <div className={`
        relative transition-all duration-300
        ${hasError ? 'ring-2 ring-red-500/50 rounded-2xl' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${readonly ? 'opacity-80' : ''}
      `}>
        {children}
      </div>

      {helpText && !hasError && (
        <p className="text-xs text-slate-500 dark:text-slate-400 pl-1">{helpText}</p>
      )}
      
      {hasError && (
        <div className="
          flex items-center gap-2 px-3 py-2 rounded-xl
          bg-red-50/80 dark:bg-red-900/20
          border border-red-200/50 dark:border-red-700/50
        ">
          <span className="text-red-500">⚠</span>
          <p className="text-xs text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
