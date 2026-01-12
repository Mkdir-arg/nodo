import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { Phone } from 'lucide-react';
import FieldShell from "../ui/FieldShell";
import { baseInputStyles } from "../ui/styles";

export default function PhoneField({ field }:{field:any}) {
  const { register } = useFormContext();
  const autoId = useId();
  const id = field.key ?? field.id ?? autoId;
  
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
        type="tel"
        className={baseInputStyles}
        {...register(field.key)}
        placeholder={field.placeholder}
        disabled={field.disabled}
        readOnly={field.readOnly}
      />
    </FieldShell>
  );
}
