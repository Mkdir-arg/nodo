"use client";

import { useController, useFormContext } from "react-hook-form";

import type { DocumentFieldProps } from "@/lib/forms/types";

import { FieldWrapper, inputBaseClass, useFieldError } from "./shared";

type Props = {
  field: (DocumentFieldProps & { type?: string }) | { type?: string; [key: string]: any };
  name: string;
};

function getFileSummary(value: unknown) {
  if (!value) return null;
  if (value instanceof File) {
    return value.name;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => (item instanceof File ? item.name : undefined))
      .filter(Boolean)
      .join(", ");
  }
  if (value instanceof FileList) {
    return Array.from(value)
      .map((f) => f.name)
      .join(", ");
  }
  return null;
}

export default function FileField({ field, name }: Props) {
  const { control } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  const { error } = useFieldError(name);
  const id = field.id ?? name;
  const summary = getFileSummary(controllerField.value);
  const accept = Array.isArray(field.accept) ? field.accept.join(",") : field.accept;
  const isMultiple = Boolean((field as any)?.multiple);

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
        type="file"
        accept={accept}
        multiple={isMultiple}
        onChange={(event) => {
          const files = event.target.files;
          if (!files || files.length === 0) {
            controllerField.onChange(undefined);
            return;
          }
          controllerField.onChange(isMultiple ? Array.from(files) : files[0]);
        }}
        onBlur={controllerField.onBlur}
        className={inputBaseClass}
      />
      {summary ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">Archivo seleccionado: {summary}</p>
      ) : null}
      {typeof field.maxSizeMB === "number" ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Tamaño máximo: {field.maxSizeMB} MB
        </p>
      ) : null}
    </FieldWrapper>
  );
}
