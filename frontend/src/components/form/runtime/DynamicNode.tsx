import { useFormContext, useWatch } from "react-hook-form";
import { evalConditions } from "@/lib/form-builder/visibility";
import TextField from "./fields/TextField";
import NumberField from "./fields/NumberField";
import SelectField from "./fields/SelectField";
import DateField from "./fields/DateField";
import DocumentField from "./fields/DocumentField";
import SumField from "./fields/SumField";
import PhoneField from "./fields/PhoneField";
import CuitRazonSocialField from "./fields/CuitRazonSocialField";
import InfoField from "./fields/InfoField";
import GroupField from "./fields/GroupField";

export default function DynamicNode({ node, prefix="" }:{node:any, prefix?:string}) {
  const { control } = useFormContext();
  const allValues = useWatch({ control });
  const key = node.key ? (prefix ? `${prefix}${node.key}` : node.key) : undefined;
  const hidden = node.condicionesOcultar ? evalConditions(allValues, node.condicionesOcultar) : false;
  if (hidden) return null;

  if (node.type === "section") {
    return (
      <fieldset className="rounded-2xl border p-4 space-y-3">
        <legend className="px-2">{node.title}</legend>
        {node.children?.map((c:any)=> <DynamicNode key={c.id} node={c} />)}
      </fieldset>
    );
  }
  const field = { ...node, key };
  switch (node.type) {
    case "text":
    case "textarea": return <TextField field={field} />;
    case "number": return <NumberField field={field} />;
    case "select":
    case "dropdown":
    case "multiselect":
    case "select_with_filter": return <SelectField field={field} />;
    case "date": return <DateField field={field} />;
    case "document": return <DocumentField field={field} />;
    case "sum": return <SumField field={field} />;
    case "phone": return <PhoneField field={field} />;
    case "cuit_razon_social": return <CuitRazonSocialField field={field} />;
    case "info": return <InfoField field={field} />;
    case "group": return <GroupField field={node} />;
    default: return null;
  }
}
