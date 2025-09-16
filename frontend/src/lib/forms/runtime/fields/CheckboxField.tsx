"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { FieldProps } from "../../types";

interface CheckboxFieldProps {
  field: Extract<FieldProps, { type: "checkbox" }>;
}

export function CheckboxField({ field }: CheckboxFieldProps) {
  const { setValue, watch, formState: { errors } } = useFormContext();
  const value = watch(field.name);
  const error = errors[field.name];
  
  return (
    <div className="space-y-3">
      <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-200">
        <Checkbox
          id={field.name}
          checked={value || false}
          onCheckedChange={(checked) => setValue(field.name, checked)}
          className="mt-0.5"
        />
        <div className="flex-1">
          {field.label && (
            <Label htmlFor={field.name} className="text-sm font-semibold text-gray-700 cursor-pointer">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          {field.description && (
            <p className="text-xs text-gray-500 mt-1">{field.description}</p>
          )}
        </div>
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error.message as string}
        </p>
      )}
    </div>
  );
}