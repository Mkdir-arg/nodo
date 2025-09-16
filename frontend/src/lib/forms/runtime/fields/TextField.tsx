"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FieldProps } from "../../types";

interface TextFieldProps {
  field: Extract<FieldProps, { type: "text" | "textarea" }>;
}

export function TextField({ field }: TextFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[field.name];
  
  const Component = field.type === "textarea" ? Textarea : Input;
  
  return (
    <div className="space-y-2">
      {field.label && (
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Component
        id={field.name}
        placeholder={field.placeholder}
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