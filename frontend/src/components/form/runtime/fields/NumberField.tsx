import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { Hash } from 'lucide-react';
import FieldShell from "../ui/FieldShell";
import { baseInputStyles } from "../ui/styles";

export default function NumberField({ field }: { field: any }) {
  const { register } = useFormContext();
  const autoId = useId();

  if (!field) return null;

  const id = field.key ?? field.id ?? autoId;
  const fieldKey = field.key || field.id || autoId;

  return (
    <FieldShell
      fieldKey={fieldKey}
      label={field.label}
      required={field.required}
      helpText={field.help}
      icon={<Hash size={16} />}
      disabled={field.disabled}
      readonly={field.readOnly}
    >
      <input
        type="number"
        className={baseInputStyles}
        id={id}
        {...register(fieldKey, { valueAsNumber: true })}
        placeholder={field.placeholder}
        disabled={field.disabled}
        readOnly={field.readOnly}
        min={field.min}
        max={field.max}
      />
    </FieldShell>
  );
}
