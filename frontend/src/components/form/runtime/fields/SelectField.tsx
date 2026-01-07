import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { ListFilter, ChevronDown, CheckSquare } from 'lucide-react';
import FieldShell from "../ui/FieldShell";
import { baseSelectStyles } from "../ui/styles";

export default function SelectField({ field }:{field:any}) {
  const { register } = useFormContext();
  const autoId = useId();
  const id = field.key ?? field.id ?? autoId;
  
  const isMulti = field.type === "multiselect";
  const icon = isMulti ? <CheckSquare size={16} /> : <ChevronDown size={16} />;
  
  return (
    <FieldShell
      fieldKey={field.key}
      label={field.label}
      required={field.required}
      helpText={field.help}
      icon={icon}
      disabled={field.disabled}
      readonly={field.readOnly}
    >
      <select
        multiple={isMulti}
        className={baseSelectStyles}
        id={id}
        {...register(field.key)}
        disabled={field.disabled}
      >
        {!isMulti && <option value="">{field.placeholder || 'Seleccionar...'}</option>}
        {field.options?.map((o:any)=>(
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldShell>
  );
}
