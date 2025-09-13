import { useFormContext } from "react-hook-form";
export default function DateField({ field }:{field:any}) {
  const { register } = useFormContext();
  return (
    <div className="flex flex-col">
      <label className="mb-1">{field.label}</label>
      <input type="date" className="border rounded px-2 py-1" {...register(field.key)} />
    </div>
  );
}
