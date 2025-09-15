"use client";

import { useController, useFormContext } from "react-hook-form";

import type { MultiSelectFieldProps, SelectOption } from "@/lib/forms/types";

import { FieldWrapper, selectBaseClass, useFieldError } from "./shared";

type Props = {
  field:
    | (MultiSelectFieldProps & { type?: string })
    | { type?: string; options?: SelectOption[]; maxSelections?: number; [key: string]: any };
  name: string;
};

export default function MultiSelectField({ field, name }: Props) {
  const { control } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  const { error } = useFieldError(name);
  const id = field.id ?? name;
  const value: string[] = Array.isArray(controllerField.value)
    ? controllerField.value.map((v) => String(v))
    : [];
  const options: SelectOption[] = Array.isArray(field.options)
    ? field.options.filter((opt): opt is SelectOption => !!opt && typeof opt.value === "string")
    : [];
  const maxSelections = typeof field.maxSelections === "number" ? field.maxSelections : undefined;

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
        multiple
        value={value}
        onChange={(event) => {
          const selected = Array.from(event.target.selectedOptions).map((opt) => opt.value);
          const next = maxSelections ? selected.slice(0, maxSelections) : selected;
          controllerField.onChange(next);
        }}
        onBlur={controllerField.onBlur}
        className={`${selectBaseClass} h-32`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {maxSelections ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Máximo {maxSelections} opción{maxSelections === 1 ? "" : "es"}
        </p>
      ) : null}
    </FieldWrapper>
  );
}
