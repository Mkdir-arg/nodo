import { useFormContext } from "react-hook-form";
export default function NumberField({ field }:{field:any}) {
  const { register } = useFormContext();
  return (
    <div className="flex flex-col">
      <label className="mb-1">{field.label}</label>
      <input
        type="number"
        className="border rounded px-2 py-1"
        step={field.step}
        min={field.min}
        max={field.max}
        {...register(field.key, { valueAsNumber: true })}
      />
    </div>
  );
}
