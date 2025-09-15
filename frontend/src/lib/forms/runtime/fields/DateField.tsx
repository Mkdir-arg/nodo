"use client";

import { useController, useFormContext } from "react-hook-form";

import type { DateFieldProps } from "@/lib/forms/types";

import { FieldWrapper, inputBaseClass, useFieldError } from "./shared";

type Props = {
  field: DateFieldProps & { type?: string };
  name: string;
};

function formatDateValue(value: unknown) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    return value.split("T")[0];
  }
  return "";
}

export default function DateField({ field, name }: Props) {
  const { control } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  const { error } = useFieldError(name);
  const id = field.id ?? name;
  const value = formatDateValue(controllerField.value);

  return (
    <FieldWrapper
      id={id}
      label={field.label}
      required={field.required}
      description={field.description}
      helpText={field.helpText}
      error={error}
    >
      <input
        id={id}
        type="date"
        value={value}
        onChange={(event) => controllerField.onChange(event.target.value || undefined)}
        onBlur={controllerField.onBlur}
        min={field.minDate}
        max={field.maxDate}
        className={inputBaseClass}
      />
    </FieldWrapper>
  );
}
