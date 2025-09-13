'use client';
import { useEffect } from 'react';
import { useTemplateStore } from '@/store/useTemplateStore';
import Canvas from './Canvas';
import Palette from './Palette';
import PropertyPanel from './PropertyPanel';

export default function Builder({ template }: { template?: any }) {
  const { setTemplate, dirty } = useTemplateStore();
  if (template) setTemplate(template);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  return (
    <div className="flex">
      <Canvas />
      <Palette />
      <PropertyPanel />
    </div>
  );
}
