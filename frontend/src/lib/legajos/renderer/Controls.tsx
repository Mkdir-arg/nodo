"use client";
import { Controller, UseFormReturn } from "react-hook-form";

export function TextField({ form, name, label, placeholder, readOnly }:
  { form: UseFormReturn<any>, name: string, label: string, placeholder?: string, readOnly?: boolean }) {
  const { register } = form;
  return (
    <div className="mb-3">
      <label className="block mb-1 text-sm text-gray-300">{label}</label>
      <input {...register(name)} placeholder={placeholder}
        readOnly={readOnly}
        className="w-full rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
    </div>
  );
}

export function NumberField({ form, name, label }:{ form:UseFormReturn<any>, name:string, label:string }) {
  const { register } = form;
  return (
    <div className="mb-3">
      <label className="block mb-1 text-sm text-gray-300">{label}</label>
      <input type="number" {...register(name)} className="w-full rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2" />
    </div>
  );
}

export function TextArea({ form, name, label }:{ form:UseFormReturn<any>, name:string, label:string }) {
  const { register } = form;
  return (
    <div className="mb-3">
      <label className="block mb-1 text-sm text-gray-300">{label}</label>
      <textarea {...register(name)} className="w-full rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2 min-h-[90px]" />
    </div>
  );
}

export function Checkbox({ form, name, label }:{ form:UseFormReturn<any>, name:string, label:string }) {
  const { register } = form;
  return (
    <label className="flex items-center gap-2 mb-3 text-gray-300">
      <input type="checkbox" {...register(name)} className="w-4 h-4 rounded border-gray-600 bg-gray-700" />
      {label}
    </label>
  );
}

export function SelectField({ form, name, label, options }:{
  form: UseFormReturn<any>, name:string, label:string, options: {value:string,label:string}[]
}) {
  const { control } = form;
  return (
    <div className="mb-3">
      <label className="block mb-1 text-sm text-gray-300">{label}</label>
      <Controller control={control} name={name} render={({ field }) => (
        <select {...field} className="w-full rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2">
          <option value="">Seleccionar…</option>
          {options?.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}/>
    </div>
  );
}
