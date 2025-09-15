"use client";

import clsx from "clsx";
import { useController, useFormContext } from "react-hook-form";

import type { FieldProps } from "@/lib/forms/types";

import { FieldWrapper, checkboxBaseClass, useFieldError } from "./shared";

type Props = {
  field: (FieldProps & { type?: string }) | { type?: string; [key: string]: any };
  name: string;
};

export default function CheckboxField({ field, name }: Props) {
  const { control } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  const { error } = useFieldError(name);
  const id = field.id ?? name;
  const checked = !!controllerField.value;

  return (
    <FieldWrapper
      id={id}
      label={field.label}
      required={field.required}
      description={field.description}
      helpText={field.helpText}
      error={error}
      renderLabel={false}
    >
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
      >
        <input
          id={id}
          type="checkbox"
          className={clsx(checkboxBaseClass, "shrink-0")}
          checked={checked}
          onChange={(event) => controllerField.onChange(event.target.checked)}
          onBlur={controllerField.onBlur}
        />
        <span>
          {field.label}
          {field.required ? <span className="ml-1 text-red-600">*</span> : null}
        </span>
      </label>
    </FieldWrapper>
  );
}
