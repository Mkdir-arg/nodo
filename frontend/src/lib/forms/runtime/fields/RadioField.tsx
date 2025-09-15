"use client";

import clsx from "clsx";
import { useController, useFormContext } from "react-hook-form";

import type { SelectOption } from "@/lib/forms/types";

import { FieldWrapper, checkboxBaseClass, useFieldError } from "./shared";

type Props = {
  field: { id?: string; label?: string; required?: boolean; description?: string; helpText?: string; options?: SelectOption[]; [key: string]: any };
  name: string;
};

export default function RadioField({ field, name }: Props) {
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
      <div className="space-y-2">
        {options.map((opt) => {
          const optionId = `${id}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={optionId}
              className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
            >
              <input
                id={optionId}
                type="radio"
                name={name}
                className={clsx(checkboxBaseClass, "rounded-full")}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => controllerField.onChange(opt.value)}
                onBlur={controllerField.onBlur}
                disabled={opt.disabled}
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
}
