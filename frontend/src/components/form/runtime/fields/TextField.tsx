import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { Type, Mail, Hash } from 'lucide-react';
import FieldShell from "../ui/FieldShell";
import { baseInputStyles, baseTextareaStyles } from "../ui/styles";

export default function TextField({ field }:{field:any}) {
  const { register } = useFormContext();
  const autoId = useId();
  const id = field.key ?? field.id ?? autoId;
  
  const inputType = field.type === 'email' ? 'email' : 'text';
  
  if (field.type === 'textarea') {
    return (
      <FieldShell
        fieldKey={field.key}
        label={field.label}
        required={field.required}
        helpText={field.help}
        disabled={field.disabled}
        readonly={field.readOnly}
      >
        <textarea
          id={id}
          className={baseTextareaStyles}
          {...register(field.key)}
          placeholder={field.placeholder}
          disabled={field.disabled}
          readOnly={field.readOnly}
        />
      </FieldShell>
    );
  }
  
  return (
    <FieldShell
      fieldKey={field.key}
      label={field.label}
      required={field.required}
      helpText={field.help}
      disabled={field.disabled}
      readonly={field.readOnly}
    >
      <input
        id={id}
        type={inputType}
        className={baseInputStyles}
        {...register(field.key)}
        placeholder={field.placeholder}
        disabled={field.disabled}
        readOnly={field.readOnly}
      />
    </FieldShell>
  );
}
