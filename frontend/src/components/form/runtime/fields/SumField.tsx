import { useFormContext, useWatch } from "react-hook-form";
export default function SumField({ field }:{field:any}) {
  const { control } = useFormContext();
  const watchedFields = useWatch({ control, name: field.sources || [] });
  const total = (field.sources || []).reduce((acc: number, key: string, index: number) => {
    const v = parseFloat(watchedFields[index] || 0);
    return acc + (isNaN(v) ? 0 : v);
  }, 0);
  return (
    <div className="flex flex-col">
      <label className="mb-1">{field.label}</label>
      <div className="border rounded px-2 py-1 bg-gray-100">{total}</div>
    </div>
  );
}
