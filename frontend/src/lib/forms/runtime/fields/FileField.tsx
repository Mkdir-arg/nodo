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
      <div className="relative">
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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200">
          <div className="text-center">
            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-gray-600">Arrastra archivos aquí</p>
            <p className="text-xs text-gray-400">o haz clic para seleccionar</p>
          </div>
        </div>
      </div>
      {summary ? (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-xs font-medium text-green-700">Archivo seleccionado: {summary}</p>
          </div>
        </div>
      ) : null}
      {typeof field.maxSizeMB === "number" ? (
        <p className="text-xs text-gray-500 mt-1">
          Tamaño máximo: {field.maxSizeMB} MB
        </p>
      ) : null}
    </FieldWrapper>
  );
}
