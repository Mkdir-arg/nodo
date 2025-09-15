import { Suspense } from "react";
import CreateView from "./_CreateView";

export default function Page({
  searchParams,
}: {
  searchParams: { formId?: string };
}) {
  const formId = searchParams?.formId;
  if (!formId) {
    return (
      <div className="p-6">
        Falta <code>formId</code>.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Nuevo legajo</h1>
      <Suspense fallback={<div className="rounded-md border p-4">Cargando…</div>}>
        <CreateView formId={formId} />
      </Suspense>
    </div>
  );
}
