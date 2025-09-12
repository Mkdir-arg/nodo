'use client';
import { useTemplateStore } from '@/store/useTemplateStore';
import { nanoid } from 'nanoid';

const types = ['text','number','select','section'];

export default function Palette() {
  const { addNode } = useTemplateStore();
  return (
    <div className="w-48 p-2">
      <h2>Campos</h2>
      {types.map(t => (
        <button key={t} className="block w-full border p-1 mb-2" onClick={()=>addNode({id:nanoid(), type:t, label:t, key:t+nanoid(4)})}>{t}</button>
      ))}
    </div>
  );
}
