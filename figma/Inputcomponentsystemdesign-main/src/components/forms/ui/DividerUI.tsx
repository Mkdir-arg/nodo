import React from 'react';

interface DividerUIProps {
  label?: string;
}

export const DividerUI: React.FC<DividerUIProps> = ({ label }) => {
  if (label) {
    return (
      <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        <span className="flex-shrink mx-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
      </div>
    );
  }

  return <hr className="my-6 border-gray-300 dark:border-gray-600" />;
};
