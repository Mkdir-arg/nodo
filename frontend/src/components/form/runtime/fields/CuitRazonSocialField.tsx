import { useId } from "react";
import { useFormContext } from "react-hook-form";
export default function CuitRazonSocialField({ field }:{field:any}) {
  const { register } = useFormContext();
  const autoId = useId();
  const baseId = field.key ?? field.id ?? autoId;
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col"><label className="mb-1" htmlFor={`${baseId}-cuit`}>CUIT</label><input id={`${baseId}-cuit`} className="border rounded px-2 py-1" {...register(`${field.key}.cuit`)} /></div>
      <div className="flex flex-col"><label className="mb-1" htmlFor={`${baseId}-razon`}>Razón Social</label><input id={`${baseId}-razon`} className="border rounded px-2 py-1" {...register(`${field.key}.razon_social`)} /></div>
    </div>
  );
}
