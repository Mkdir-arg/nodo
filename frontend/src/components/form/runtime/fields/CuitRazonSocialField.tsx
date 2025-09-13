import { useFormContext } from "react-hook-form";
export default function CuitRazonSocialField({ field }:{field:any}) {
  const { register } = useFormContext();
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col"><label className="mb-1">CUIT</label><input className="border rounded px-2 py-1" {...register(`${field.key}.cuit`)} /></div>
      <div className="flex flex-col"><label className="mb-1">Razón Social</label><input className="border rounded px-2 py-1" {...register(`${field.key}.razon_social`)} /></div>
    </div>
  );
}
