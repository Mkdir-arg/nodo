"use client";

import clsx from "clsx";
import { useController, useFormContext } from "react-hook-form";

import type { FieldProps } from "@/lib/forms/types";

import { FieldWrapper, useFieldError } from "./shared";

type Props = {
  field: (FieldProps & { type?: string }) | { type?: string; [key: string]: any };
  name: string;
};

export default function SwitchField({ field, name }: Props) {
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
        className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200"
      >
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => controllerField.onChange(!checked)}
          onBlur={controllerField.onBlur}
          className={clsx(
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border transition",
            checked
              ? "border-transparent bg-blue-600"
              : "border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"
          )}
        >
          <span
            aria-hidden="true"
            className={clsx(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
              checked ? "translate-x-5" : "translate-x-1"
            )}
          />
        </button>
        <span>
          {field.label}
          {field.required ? <span className="ml-1 text-red-600">*</span> : null}
        </span>
      </label>
    </FieldWrapper>
  );
}
