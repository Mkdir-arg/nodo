"use client";

import { useController, useFormContext } from "react-hook-form";

import type { SelectFieldProps, SelectOption } from "@/lib/forms/types";

import { FieldWrapper, selectBaseClass, useFieldError } from "./shared";

type Props = {
  field: (SelectFieldProps & { type?: string }) | { type?: string; options?: SelectOption[]; [key: string]: any };
  name: string;
};

export default function SelectField({ field, name }: Props) {
  const { control } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  const { error } = useFieldError(name);
  const id = field.id ?? name;
  const value = controllerField.value ?? "";
  const options: SelectOption[] = Array.isArray(field.options)
    ? field.options.filter((opt): opt is SelectOption => !!opt && typeof opt.value === "string")
    : [];

  return (
    <FieldWrapper
      id={id}
      label={field.label}
      required={field.required}
      description={field.description}
      helpText={field.helpText}
      error={error}
    >
      <select
        id={id}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          controllerField.onChange(next === "" ? undefined : next);
        }}
        onBlur={controllerField.onBlur}
        className={selectBaseClass}
      >
        <option value="" disabled={field.required}>
          {field.placeholder ?? "Seleccione una opción"}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
