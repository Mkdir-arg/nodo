'use client';
import { useEffect } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import Canvas from './Canvas';
import Palette from '@/components/form/builder/Palette';
import PropertyPanel from './PropertyPanel';

export default function Builder({ template }: { template?: any }) {
  const { setTemplate, dirty } = useBuilderStore();
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
