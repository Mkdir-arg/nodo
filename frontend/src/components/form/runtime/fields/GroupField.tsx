import { useFormContext, useFieldArray } from "react-hook-form";
import DynamicNode from "../DynamicNode";

export default function GroupField({ field }:{field:any}) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: field.key });
  return (
    <div className="space-y-2">
      <div className="flex justify-between"><label>{field.label}</label><button type="button" onClick={()=>append({})} className="border px-2">+</button></div>
      {fields.map((f, idx) => (
        <div key={f.id} className="border rounded p-2 space-y-2">
          {field.children?.map((c:any)=> <DynamicNode key={c.id} node={c} prefix={`${field.key}.${idx}.`} />)}
          <button type="button" className="border px-2" onClick={()=>remove(idx)}>Eliminar</button>
        </div>
      ))}
    </div>
  );
}
