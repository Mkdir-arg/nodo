import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FieldSize } from '@/types/form';

interface ImageUploadProps {
  id: string;
  label?: string;
  value?: File | null;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: FieldSize;
  maxSize?: number; // en MB
  onChange?: (file: File | null) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  id,
  label,
  value,
  required,
  disabled,
  error,
  size = 'md',
  maxSize = 5,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      onChange?.(null);
      setPreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen');
      return;
    }

    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`La imagen excede el tamaño máximo de ${maxSize}MB`);
      return;
    }

    onChange?.(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
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
          relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer overflow-hidden
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
          accept="image/*"
          required={required}
          disabled={disabled}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="sr-only"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="absolute top-2 right-2 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            {value && (
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">{value.name}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Arrastra una imagen o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF hasta {maxSize}MB
            </p>
          </div>
        )}
      </div>

      <FormError message={error} />
    </div>
  );
};
