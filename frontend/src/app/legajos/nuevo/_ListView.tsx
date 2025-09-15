"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { getJSON } from "@/lib/api";


type ListResponse = {
  results: Array<Record<string, any>>;
  next: string | null;
  previous: string | null;
  count: number;
};

async function fetchLegajos({
  formId,
  page = 1,
  search = "",
}: {
  formId: string;
  page?: number;
  search?: string;
}) {

  if (typeof window === "undefined") {
    throw new Error("fetchLegajos solo está disponible en el cliente");

  }

  const url = new URL(`/api/legajos`, window.location.origin);
  url.searchParams.set("plantilla_id", formId);
  url.searchParams.set("page", String(page));
  if (search) {
    url.searchParams.set("search", search);
  }

  return getJSON<ListResponse>(`${url.pathname}${url.search}`);
}

function fmtDate(value?: string) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function guessDisplay(row: any) {
  if (row?.display) return row.display;
  const data = row?.data || {};
  const containers = [data, data.ciudadano, data.persona, data.titular];
  for (const item of containers) {
    if (item && typeof item === "object") {
      const apellido = item.apellido || item.last_name || item.apellidos;
      const nombre = item.nombre || item.first_name || item.nombres;
      if (apellido && nombre) return `${apellido}, ${nombre}`;
      if (nombre) return nombre;
      if (apellido) return apellido;
    }
  }
  return row?.id || "—";
}

export default function ListView({ formId }: { formId: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPage(1);
    setSearch("");
  }, [formId]);

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["legajos", formId, page, search],
    queryFn: () => fetchLegajos({ formId, page, search }),
    placeholderData: (previousData) => previousData,
  });

  const rows = useMemo(() => data?.results ?? [], [data?.results]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Buscar…"
          className="h-10 w-72 rounded-md border border-slate-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        {isFetching && !isLoading && (
          <span className="text-xs text-slate-500">Actualizando…</span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Creado</th>
              <th className="px-4 py-2">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6" colSpan={4}>
                  Cargando…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="px-4 py-6 text-red-600" colSpan={4}>
                  Error al cargar la lista.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6" colSpan={4}>
                  Sin registros todavía.
                </td>
              </tr>
            ) : (
              rows.map((row: any) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-2 font-medium text-slate-700">{guessDisplay(row)}</td>
                  <td className="px-4 py-2 text-slate-600">{row.estado || "—"}</td>
                  <td className="px-4 py-2 text-slate-600">{fmtDate(row.created_at)}</td>
                  <td className="px-4 py-2 text-slate-600">{fmtDate(row.updated_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <button
          type="button"
          className="rounded-md border px-3 py-2 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={!data?.previous}
        >
          Anterior
        </button>
        <div className="text-xs text-slate-500">
          Página {page} {data?.count ? `de ${Math.max(1, Math.ceil(data.count / 10))}` : ""}
        </div>
        <button
          type="button"
          className="rounded-md border px-3 py-2 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setPage((current) => current + 1)}
          disabled={!data?.next}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
