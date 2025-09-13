'use client';
import { useEffect, useState } from 'react';
import DynamicForm from '@/components/form/runtime/DynamicForm';

export default function PreviewPage() {
  const [schema, setSchema] = useState<any>();
  useEffect(()=>{ const s = localStorage.getItem('nodo.plantilla.preview'); if(s) setSchema(JSON.parse(s)); },[]);
  if(!schema) return <div>No hay previsualización</div>;
  return <DynamicForm schema={schema} onSubmit={()=>{}}/>;
}
