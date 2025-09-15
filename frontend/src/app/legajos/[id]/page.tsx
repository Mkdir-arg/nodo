
import SectionRenderer from "@/components/legajo/SectionRenderer";
import { getJSON } from "@/lib/api";

type LegajoResponse = {
  data?: Record<string, unknown>;
  schema?: {
    nodes?: unknown[];
    sections?: unknown[];
  };
  meta?: Record<string, unknown>;
};

export default async function LegajoDetallePage({ params }: { params: { id: string } }) {
  const response = await getJSON<LegajoResponse>(`/api/legajos/${params.id}`, { cache: "no-store" });

  const data = response.data ?? {};
  const schema = response.schema ?? {};
  const meta = response.meta ?? {};

  const sections = schema?.nodes || schema?.sections || [];

  return (
    <div className="space-y-8">
      {sections.map((s: any) => (
        <SectionRenderer key={s.id} section={s} ctx={{ data, meta }} />
      ))}
    </div>
  );
}
