import { useId } from "react";
import { useFormContext } from "react-hook-form";
export default function NumberField({ field }:{field:any}) {
  const { register } = useFormContext();
  const autoId = useId();
  const id = field.key ?? field.id ?? autoId;
  return (
    <div className="flex flex-col">
      <label className="mb-1" htmlFor={id}>{field.label}</label>
      <input
        type="number"
        className="border rounded px-2 py-1"
        id={id}
        {...register(field.key, { valueAsNumber: true })}
      />
    </div>
  );
}
