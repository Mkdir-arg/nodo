import React, { useRef, useEffect } from 'react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';
import { Code, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeInputProps {
  id: string;
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  size?: FieldSize;
  language?: string;
  showLineNumbers?: boolean;
  minRows?: number;
  maxRows?: number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const CodeInput: React.FC<CodeInputProps> = ({
  id,
  label,
  value = '',
  placeholder,
  required,
  disabled,
  readonly,
  error,
  size = 'md',
  language = 'javascript',
  showLineNumbers = true,
  minRows = 5,
  maxRows = 20,
  onChange,
  onBlur,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [rows, setRows] = useState(minRows);

  useEffect(() => {
    if (textareaRef.current && value) {
      const lineCount = value.split('\n').length;
      const newRows = Math.min(Math.max(lineCount, minRows), maxRows);
      setRows(newRows);
    }
  }, [value, minRows, maxRows]);

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lineNumbers = value.split('\n').map((_, i) => i + 1);

  const baseClasses = 'w-full rounded-lg border transition-all duration-200 outline-none resize-none font-mono';
  
  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900';
  
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
    : 'bg-gray-900 dark:bg-gray-950';
  
  const readonlyClasses = readonly
    ? 'bg-gray-50 dark:bg-gray-800 cursor-default'
    : '';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
        
        <div className="flex items-center gap-2">
          {language && (
            <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono">
              {language}
            </span>
          )}
          
          {value && !readonly && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Copiar código"
            >
              {copied ? (
                <Check className={iconSizeClasses[size]} />
              ) : (
                <Copy className={iconSizeClasses[size]} />
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="relative">
        <div className={`
          flex rounded-lg border overflow-hidden
          ${stateClasses}
          ${disabledClasses}
        `}>
          {showLineNumbers && (
            <div className="
              flex flex-col items-end pr-3 py-2 pl-3
              bg-gray-800 dark:bg-gray-900 
              text-gray-500 dark:text-gray-600
              border-r border-gray-700 dark:border-gray-800
              select-none font-mono text-xs leading-6
            ">
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>
          )}
          
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            placeholder={placeholder || '// Escribe tu código aquí...'}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            rows={rows}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            className={`
              flex-1
              ${sizeClasses[size]}
              ${readonlyClasses}
              text-gray-100 dark:text-gray-100
              placeholder:text-gray-500 dark:placeholder:text-gray-600
              bg-gray-900 dark:bg-gray-950
              border-none outline-none focus:ring-0
              leading-6
            `}
            spellCheck={false}
          />
        </div>
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
        <span>{value.split('\n').length} líneas</span>
        <span>{value.length} caracteres</span>
      </div>
      
      <FormError message={error} />
    </div>
  );
};
