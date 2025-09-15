import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
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

function isUiNode(n:any){ return n?.kind==='ui' || String(n?.type||'').startsWith('ui:'); }

export default function DynamicNode({ node, prefix="" }:{node:any, prefix?:string}) {
  const { control } = useFormContext();
  const allValues = useWatch({ control });
  const key = node.key ? (prefix ? `${prefix}${node.key}` : node.key) : undefined;
  const hidden = node.condicionesOcultar ? evalConditions(allValues, node.condicionesOcultar) : false;
  if (hidden) return null;

  if (isUiNode(node)) return null;
  if (node.type === "section") {
    return (
      <fieldset className="rounded-2xl border p-4 space-y-3">
        <legend className="px-2">{node.title}</legend>
        {node.children?.map((c:any)=> <DynamicNode key={c.id} node={c} />)}
      </fieldset>
    );
  }
  if (node.type === "tabs") {
    const tabs = Array.isArray(node.tabs) ? node.tabs : [];
    const fallbackId = tabs.find((tab: any) => typeof tab?.id === "string" && tab.id)?.id;
    const [activeTab, setActiveTab] = useState<string>(fallbackId || "");
    const currentId = activeTab || fallbackId || "";
    const children = currentId && node.tabsChildren ? node.tabsChildren[currentId] : undefined;
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/40">
        {node.title ? (
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{node.title}</h3>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab: any) => {
            const tabId = typeof tab?.id === "string" ? tab.id : "";
            if (!tabId) return null;
            const isActive = tabId === currentId;
            return (
              <button
                type="button"
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab?.title || "Pestaña"}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {Array.isArray(children)
            ? children.map((child: any) => (
                <DynamicNode key={child?.id ?? `${currentId}-${Math.random()}`} node={child} prefix={prefix} />
              ))
            : null}
        </div>
      </div>
    );
  }
  if (node.type === "repeater") {
    const name = key || node.fieldKey || node.key || node.id;
    const { fields, append, remove } = useFieldArray({ control, name });
    const minItems = typeof node.minItems === "number" ? node.minItems : 0;
    const canRemove = fields.length > minItems;
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/40">
        {node.title ? (
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{node.title}</h3>
        ) : null}
        <div className="space-y-3">
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-900/50"
            >
              {(node.children || []).map((child: any) => (
                <DynamicNode
                  key={child?.id ?? `${name}-${index}-${Math.random()}`}
                  node={child}
                  prefix={`${name}.${index}.`}
                />
              ))}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={!canRemove}
                  className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/70 dark:text-red-200"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => append({})}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Agregar
          </button>
        </div>
      </div>
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
