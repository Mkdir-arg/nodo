'use client';
import { useTemplateStore } from '@/store/useTemplateStore';
import Canvas from './Canvas';
import Palette from './Palette';
import PropertyPanel from './PropertyPanel';

export default function Builder({ template }: { template?: any }) {
  const { nodes, setTemplate } = useTemplateStore();
  if (template) setTemplate(template);
  return (
    <div className="flex">
      <Canvas />
      <Palette />
      <PropertyPanel />
    </div>
  );
}
