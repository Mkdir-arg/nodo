import React, { useRef, useState } from 'react';
import { Upload, File, X, Check } from 'lucide-react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';

interface DocumentUploadProps {
  id: string;
  label?: string;
  value?: File | null;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: FieldSize;
  accept?: string;
  maxSize?: number; // en MB
  onChange?: (file: File | null) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  id,
  label,
  value,
  required,
  disabled,
  error,
  size = 'md',
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSize = 10,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      onChange?.(null);
      return;
    }

    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`El archivo excede el tamaño máximo de ${maxSize}MB`);
      return;
    }

    onChange?.(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
            : error
              ? 'border-red-500 bg-red-50 dark:bg-red-950'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${size === 'sm' ? 'p-4' : size === 'lg' ? 'p-8' : 'p-6'}
        `}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          required={required}
          disabled={disabled}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="sr-only"
        />

        {value ? (
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <File className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {value.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(value.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Arrastra un archivo o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tamaño máximo: {maxSize}MB
            </p>
          </div>
        )}
      </div>

      <FormError message={error} />
    </div>
  );
};
