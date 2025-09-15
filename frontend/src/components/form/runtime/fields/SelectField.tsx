import { useId } from "react";
import { useFormContext } from "react-hook-form";
export default function SelectField({ field }:{field:any}) {
  const { register } = useFormContext();
  const autoId = useId();
  const id = field.key ?? field.id ?? autoId;
  if (field.type === "multiselect") {
    return (
      <div className="flex flex-col">
        <label className="mb-1" htmlFor={id}>{field.label}</label>
        <select multiple className="border rounded px-2 py-1" id={id} {...register(field.key)}>
          {field.options?.map((o:any)=>(<option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <label className="mb-1" htmlFor={id}>{field.label}</label>
      <select className="border rounded px-2 py-1" id={id} {...register(field.key)}>
        <option value="">{field.placeholder}</option>
        {field.options?.map((o:any)=>(<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </div>
  );
}
