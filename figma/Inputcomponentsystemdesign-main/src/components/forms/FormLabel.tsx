import React from 'react';

interface FormLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormLabel: React.FC<FormLabelProps> = ({ htmlFor, required, children }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5"
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};
