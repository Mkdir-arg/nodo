import SectionRenderer from "@/components/legajo/SectionRenderer";
import { getJSON } from "@/lib/api";

export default async function LegajoDetallePage({ params }: { params: { id: string } }) {
  const { data, schema, meta } = await getJSON(`/api/legajos/${params.id}`, { cache: "no-store" });
  const sections = schema?.nodes || schema?.sections || [];

  return (
    <div className="space-y-8">
      {sections.map((s: any) => (
        <SectionRenderer key={s.id} section={s} ctx={{ data, meta }} />
      ))}
    </div>
  );
}
