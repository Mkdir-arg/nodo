import SectionRenderer from '@/components/legajo/SectionRenderer';

export default async function LegajoDetallePage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/legajos/${params.id}`, {
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
