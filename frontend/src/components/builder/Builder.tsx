'use client';
import { useEffect, useState } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import Canvas from './Canvas';
import ComponentSidebar from '@/components/form/builder/ComponentSidebar';
import FloatingToolbar from '@/components/form/builder/FloatingToolbar';
import ComponentsModal from '@/components/form/builder/ComponentsModal';

export default function Builder({ template }: { template?: any }) {
  const { setTemplate, dirty, sections, addSection } = useBuilderStore();

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

  const [open, setOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[20rem_1fr_auto] gap-6">
      <ComponentSidebar />
      <div id="canvas" className="min-h-[70vh] border border-dashed rounded-2xl p-4">
        <Canvas />
      </div>
      <div className="hidden lg:block">
        <FloatingToolbar onPlus={() => setOpen(true)} />
      </div>
      <ComponentsModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
