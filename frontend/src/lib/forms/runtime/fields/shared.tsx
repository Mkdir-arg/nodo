"use client";

import clsx from "clsx";
import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

export const inputBaseClass =
  "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-blue-400";

export const textareaBaseClass =
  "min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-blue-400";

export const selectBaseClass =
  "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-blue-400";

export const checkboxBaseClass =
  "h-4 w-4 rounded border border-slate-300 text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:border-slate-600";

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
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
          {required ? <span className="ml-1 text-red-600">*</span> : null}
        </label>
      ) : null}
      {children}
      {description ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}
      {helpText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
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
