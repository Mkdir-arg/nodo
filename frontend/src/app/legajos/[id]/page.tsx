import SectionRenderer from '@/components/legajo/SectionRenderer';
import { getApiBaseUrl } from '@/lib/env';

export default async function LegajoDetallePage({ params }: { params: { id: string } }) {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error('No se configuró la URL de la API');
  }
  const res = await fetch(`${base}/api/legajos/${params.id}`, {
    cache: 'no-store',
  });
  const { data, schema, meta } = await res.json();
  const sections = schema?.nodes || schema?.sections || [];

  return (
    <div className="space-y-8">
      {sections.map((s: any) => (
        <SectionRenderer key={s.id} section={s} ctx={{ data, meta }} />
      ))}
    </div>
  );
}
