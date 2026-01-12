import React from 'react';

interface HeaderUIProps {
  image?: string;
  title: string;
  description?: string;
}

export const HeaderUI: React.FC<HeaderUIProps> = ({
  image,
  title,
  description,
}) => {
  return (
    <div className="w-full mb-8">
      {image && (
        <div className="w-full h-48 rounded-t-lg overflow-hidden mb-4">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className={`${image ? 'p-6 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg' : ''}`}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
