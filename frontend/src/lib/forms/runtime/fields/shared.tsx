"use client";

import clsx from "clsx";
import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

export const inputBaseClass =
  "flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50";

export const textareaBaseClass =
  "min-h-[120px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 resize-none";

export const selectBaseClass =
  "flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50";

export const checkboxBaseClass =
  "h-5 w-5 rounded-md border-2 border-gray-200 text-blue-600 transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 checked:bg-blue-600 checked:border-blue-600";

interface FieldWrapperProps {
  id: string;
  label?: string;
  required?: boolean;
  description?: string | null;
  helpText?: string | null;
  error?: string | null;
  children: ReactNode;
  className?: string;
  renderLabel?: boolean;
}

export function FieldWrapper({
  id,
  label,
  required,
  description,
  helpText,
  error,
  children,
  className,
  renderLabel = true,
}: FieldWrapperProps) {
  return (
    <div className={clsx("space-y-2", className)}>
      {renderLabel && label ? (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-700 tracking-tight"
        >
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {description ? (
        <p className="text-xs text-gray-500">{description}</p>
      ) : null}
      {helpText ? (
        <p className="text-xs text-gray-500">{helpText}</p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function useFieldError(name: string) {
  const { getFieldState, formState } = useFormContext();
  const state = getFieldState(name, formState);
  return {
    error: state.error?.message ?? null,
    invalid: state.invalid,
  };
}
