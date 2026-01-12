import React, { useState, KeyboardEvent } from 'react';
import { X, Tag } from 'lucide-react';
import { FormLabel } from '../../FormLabel';
import { FormError } from '../../FormError';
import { FieldSize } from '@/types/form-fields';
import { getStateClasses, disabledClasses, readonlyClasses } from '../../field-styles';

interface TagFieldProps {
  id: string;
  label?: string;
  value?: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  size?: FieldSize;
  maxTags?: number;
  onChange?: (value: string[]) => void;
}

const sizeClasses: Record<FieldSize, string> = {
  sm: 'min-h-8 px-2 py-1 text-sm',
  md: 'min-h-10 px-3 py-1.5 text-base',
  lg: 'min-h-12 px-4 py-2 text-lg',
};

const tagSizeClasses: Record<FieldSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const iconSizeClasses: Record<FieldSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const TagField: React.FC<TagFieldProps> = ({
  id,
  label,
  value = [],
  placeholder,
  required,
  disabled,
  readonly,
  error,
  size = 'md',
  maxTags,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) return;
    if (maxTags && value.length >= maxTags) return;
    if (value.includes(trimmedValue)) {
      setInputValue('');
      return;
    }

    onChange?.([...value, trimmedValue]);
    setInputValue('');
  };

  const removeTag = (index: number) => {
    if (readonly || disabled) return;
    const newTags = value.filter((_, i) => i !== index);
    onChange?.(newTags);
  };

  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      
      <div className={`
        w-full rounded-lg border transition-all duration-200 outline-none
        ${sizeClasses[size]}
        ${getStateClasses(error)}
        ${disabledClasses(disabled)}
        ${readonlyClasses(readonly)}
        flex flex-wrap gap-2 items-center
      `}>
        {value.map((tag, index) => (
          <span
            key={index}
            className={`
              ${tagSizeClasses[size]}
              inline-flex items-center gap-1.5 rounded-md
              bg-blue-100 dark:bg-blue-900/30
              text-blue-700 dark:text-blue-300
              border border-blue-200 dark:border-blue-800
              transition-colors
            `}
          >
            <Tag className={iconSizeClasses[size]} />
            <span>{tag}</span>
            {!readonly && !disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
              >
                <X className={iconSizeClasses[size]} />
              </button>
            )}
          </span>
        ))}
        
        {(!maxTags || value.length < maxTags) && !readonly && (
          <input
            id={id}
            type="text"
            value={inputValue}
            placeholder={value.length === 0 ? placeholder || 'Escribe y presiona Enter...' : ''}
            disabled={disabled}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:cursor-not-allowed"
          />
        )}
      </div>
      
      {maxTags && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {value.length}/{maxTags} tags
        </div>
      )}
      
      <FormError message={error} />
    </div>
  );
};
