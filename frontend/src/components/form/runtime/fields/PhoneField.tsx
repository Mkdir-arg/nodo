import { useFormContext } from "react-hook-form";
export default function PhoneField({ field }:{field:any}) {
  const { register } = useFormContext();
  return (
    <div className="flex flex-col">
      <label className="mb-1">{field.label}</label>
      <input className="border rounded px-2 py-1" {...register(field.key)} />
    </div>
  );
}
