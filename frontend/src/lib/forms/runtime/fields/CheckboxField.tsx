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
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.name}
          checked={value || false}
          onCheckedChange={(checked) => setValue(field.name, checked)}
        />
        {field.label && (
          <Label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
      </div>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  );
}