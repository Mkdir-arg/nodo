'use client';
import { useEffect, useState } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import Canvas from './Canvas';
import FloatingToolbar from './FloatingToolbar';
import ComponentsModal from './ComponentsModal';
import BuilderHeader from './BuilderHeader';
import FieldPropertiesModal from './FieldPropertiesModal';

export default function Builder({ template }: { template?: any }) {
  const { setTemplate, dirty, sections, addSection, selected } = useBuilderStore();
  const [openComponents, setOpenComponents] = useState(false);
  const [propsId, setPropsId] = useState<string | null>(null);

  useEffect(() => {
    if (template) setTemplate(template);
  }, [template, setTemplate]);

  useEffect(() => {
    if (!sections || sections.length === 0) addSection();
  }, [sections?.length, addSection]);

  useEffect(() => {
    if (selected?.type === 'field') setPropsId(selected.id);
  }, [selected]);

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
    <>
      <BuilderHeader />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_16rem] gap-6">
        {/* CANVAS grande */}
        <div id="canvas" className="min-h-[70vh] border border-dashed rounded-2xl p-4 bg-white/40">
          <Canvas />
        </div>
        {/* MENÚ chico (toolbar/“+” -> modal de componentes) */}
        <div className="sticky top-24 h-fit">
          <FloatingToolbar onPlus={() => setOpenComponents(true)} />
        </div>
        <ComponentsModal open={openComponents} onClose={() => setOpenComponents(false)} />
        <FieldPropertiesModal open={!!propsId} fieldId={propsId} onClose={() => setPropsId(null)} />
      </div>
    </>
  );
}
