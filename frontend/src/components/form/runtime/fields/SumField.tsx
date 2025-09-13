import { useFormContext, useWatch } from "react-hook-form";
export default function SumField({ field }:{field:any}) {
  const { control } = useFormContext();
  const values = useWatch({ control });
  const total = (field.sources||[]).reduce((acc:string|number, key:string) => {
    const v = parseFloat(values[key]||0);
    return acc + (isNaN(v)?0:v);
  }, 0 as number);
  return (
    <div className="flex flex-col">
      <label className="mb-1">{field.label}</label>
      <div className="border rounded px-2 py-1 bg-gray-100">{total}</div>
    </div>
  );
}
