"use client";

import { useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FieldProps } from "../../types";

interface SelectFieldProps {
  field: Extract<FieldProps, { type: "select" }>;
}

export function SelectField({ field }: SelectFieldProps) {
  const { setValue, watch, formState: { errors } } = useFormContext();
  const value = watch(field.name);
  const error = errors[field.name];
  
  return (
    <div className="space-y-2">
      {field.label && (
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={(val) => setValue(field.name, val)}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={field.placeholder || "Seleccionar..."} />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  );
}