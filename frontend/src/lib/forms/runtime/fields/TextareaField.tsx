"use client";

import { useFormContext } from "react-hook-form";

import type { TextFieldProps } from "@/lib/forms/types";

import { FieldWrapper, textareaBaseClass, useFieldError } from "./shared";

type Props = {
  field: TextFieldProps & { type?: string };
  name: string;
};

export default function TextareaField({ field, name }: Props) {
  const { register } = useFormContext();
  const { error } = useFieldError(name);
  const id = field.id ?? name;

  return (
    <FieldWrapper
      id={id}
      label={field.label}
      required={field.required}
      description={field.description}
      helpText={field.helpText}
      error={error}
    >
      <textarea
        id={id}
        {...register(name)}
        placeholder={field.placeholder ?? ""}
        maxLength={field.maxLength}
        className={textareaBaseClass}
      />
    </FieldWrapper>
  );
}
