"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldProps } from "../../types";

interface DateFieldProps {
  field: Extract<FieldProps, { type: "date" }>;
}

export function DateField({ field }: DateFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[field.name];
  
  return (
    <div className="space-y-2">
      {field.label && (
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        id={field.name}
        type="date"
        min={field.minDate}
        max={field.maxDate}
        {...register(field.name)}
        className={error ? "border-red-500" : ""}
      />
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  );
}