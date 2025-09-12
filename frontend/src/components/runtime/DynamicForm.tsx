'use client';
import { useForm } from 'react-hook-form';

export default function DynamicForm({ template, onSubmit }: { template: any; onSubmit: (data: any) => void }) {
  const { register, handleSubmit } = useForm();
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {template.nodes?.map((n: any) => {
        if (n.type === 'text') return <div key={n.id}><label>{n.label}<input {...register(n.key)} className="border"/></label></div>;
        if (n.type === 'number') return <div key={n.id}><label>{n.label}<input type="number" {...register(n.key)} className="border"/></label></div>;
        return null;
      })}
      <button type="submit" className="border px-4 py-1">Guardar</button>
    </form>
  );
}
