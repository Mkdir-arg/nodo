"use client";

import { useFormContext } from "react-hook-form";
import { FieldWrapper, inputBaseClass, useFieldError } from "./shared";

type Props = {
  field: { label?: string; required?: boolean; placeholder?: string; [key: string]: any };
  name: string;
};

export default function PhoneField({ field, name }: Props) {
  const { register } = useFormContext();
  const { error } = useFieldError(name);
  const id = field.id ?? name;

  return (
    <FieldWrapper
      id={id}
      label={field.label}
      required={field.required}
      error={error}
    >
      <input
        id={id}
        type="tel"
        {...register(name)}
        placeholder={field.placeholder ?? "+54 11 1234-5678"}
        className={inputBaseClass}
      />
    </FieldWrapper>
  );
}