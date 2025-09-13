'use client';
import { useEffect, useState } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import ComponentSidebar from './ComponentSidebar';
import Canvas from './Canvas';
import FloatingToolbar from './FloatingToolbar';
import ComponentsModal from './ComponentsModal';
import PropertiesPanel from './PropertiesPanel';

export default function Builder({ template }: { template?: any }) {
  const { setTemplate, dirty, sections, addSection } = useBuilderStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (template) setTemplate(template);
  }, [template, setTemplate]);

  useEffect(() => {
    if (!sections || sections.length === 0) addSection();
  }, [sections?.length, addSection]);

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
    <div className="grid grid-cols-1 lg:grid-cols-[20rem_1fr_20rem] gap-6">
      <ComponentSidebar />
      <div id="canvas" className="min-h-[70vh] border border-dashed rounded-2xl p-4">
        <Canvas />
      </div>
      <div className="hidden lg:flex lg:flex-col lg:gap-4">
        <FloatingToolbar onPlus={() => setOpen(true)} />
        <PropertiesPanel />
      </div>
      <ComponentsModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
