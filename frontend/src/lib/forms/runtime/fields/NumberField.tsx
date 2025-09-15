"use client";

import { useController, useFormContext } from "react-hook-form";

import type { NumberFieldProps } from "@/lib/forms/types";

import { FieldWrapper, inputBaseClass, useFieldError } from "./shared";

type Props = {
  field: NumberFieldProps & { type?: string };
  name: string;
};

export default function NumberField({ field, name }: Props) {
  const { control } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  const { error } = useFieldError(name);
  const id = field.id ?? name;
  const value = controllerField.value;

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
        type="number"
        inputMode="decimal"
        value={value ?? ""}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            controllerField.onChange(undefined);
            return;
          }
          const next = Number(raw);
          controllerField.onChange(Number.isNaN(next) ? undefined : next);
        }}
        onBlur={controllerField.onBlur}
        min={field.min}
        max={field.max}
        step={field.step}
        className={inputBaseClass}
      />
    </FieldWrapper>
  );
}
