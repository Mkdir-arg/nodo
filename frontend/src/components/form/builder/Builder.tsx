'use client';
import { useEffect, useState } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import Canvas from './Canvas';
import FloatingToolbar from '@/components/form/builder/FloatingToolbar';
import ComponentsModal from '@/components/form/builder/ComponentsModal';
import FieldPropertiesModal from '@/components/form/builder/FieldPropertiesModal';

export default function Builder({ template }: { template?: any }) {
  const { setTemplate, dirty, sections, addSection } = useBuilderStore();
  const [openComponents, setOpenComponents] = useState(false);
  const [propsId, setPropsId] = useState<string | null>(null);

  useEffect(() => {
    if (template) setTemplate(template);
  }, [template, setTemplate]);

  useEffect(() => {
    if (!sections?.length) addSection();
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

  // Listen for "builder:open-props" events
  useEffect(() => {
    const open = (e: any) => setPropsId(e.detail?.id || null);
    window.addEventListener('builder:open-props', open as any);
    return () => window.removeEventListener('builder:open-props', open as any);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_16rem] gap-6">
      <div id="canvas" className="min-h-[70vh] border border-dashed rounded-2xl p-4 bg-white/40">
        <Canvas />
      </div>
      <div className="sticky top-24 h-fit">
        <FloatingToolbar onPlus={() => setOpenComponents(true)} />
      </div>

      <ComponentsModal open={openComponents} onClose={() => setOpenComponents(false)} />
      <FieldPropertiesModal open={!!propsId} fieldId={propsId} onClose={() => setPropsId(null)} />
    </div>
  );
}
