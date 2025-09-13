'use client';
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicNode from "./DynamicNode";
import { zodFromTemplate } from "@/lib/form-builder/zod";

export default function DynamicForm({ schema, onSubmit }:{schema:any, onSubmit:(data:any)=>void}) {
  const zodSchema = zodFromTemplate(schema.nodes || []);
  const methods = useForm({ resolver: zodResolver(zodSchema) });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        {schema.nodes?.map((n:any)=>(<DynamicNode key={n.id} node={n} />))}
        <button type="submit" className="border px-4 py-1">Guardar</button>
      </form>
    </FormProvider>
  );
}
