import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { FormLabel } from '../../FormLabel';
import { FormError } from '../../FormError';
import { FieldSize } from '@/types/form-fields';

interface RatingFieldProps {
  id: string;
  label?: string;
  value?: number;
  maxRating?: number;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  size?: FieldSize;
  onChange?: (value: number) => void;
}

const starSizeClasses: Record<FieldSize, string> = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const RatingField: React.FC<RatingFieldProps> = ({
  id,
  label,
  value = 0,
  maxRating = 5,
  required,
  disabled,
  readonly,
  error,
  size = 'md',
  onChange,
}) => {
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const handleClick = (rating: number) => {
    if (!disabled && !readonly) {
      onChange?.(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled && !readonly) {
      setHoveredRating(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const getStarFill = (index: number) => {
    const rating = hoveredRating || value;
    return index <= rating;
  };

  const cursorClass = disabled 
    ? 'cursor-not-allowed' 
    : readonly 
    ? 'cursor-default' 
    : 'cursor-pointer';

  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      
      <div 
        className={`flex gap-1 ${cursorClass}`}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            disabled={disabled}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            className={`
              transition-all duration-150
              ${disabled ? 'opacity-50' : 'hover:scale-110'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
            `}
          >
            <Star
              className={`
                ${starSizeClasses[size]}
                transition-colors duration-150
                ${getStarFill(rating)
                  ? error
                    ? 'fill-red-500 text-red-500'
                    : 'fill-yellow-400 text-yellow-400'
                  : error
                  ? 'text-red-300 dark:text-red-800'
                  : 'text-gray-300 dark:text-gray-600'
                }
              `}
            />
          </button>
        ))}
        
        {value > 0 && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
            {value}/{maxRating}
          </span>
        )}
      </div>
      
      <FormError message={error} />
    </div>
  );
};
