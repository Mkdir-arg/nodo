"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getJSON } from "@/lib/api";
import { SendToFlowButton } from "@/components/legajos/SendToFlowButton";
import { buildQueryOptions } from "@/lib/queryDefaults";

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

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const cols = 'grid grid-cols-[1fr_120px_160px_120px_40px] gap-[20px] items-center';

export default function ListView({ formId }: { formId: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPage(1);
    setSearch("");
  }, [formId]);

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["legajos", formId, page, search],
    queryFn: () => fetchLegajos({ formId, page, search }),
    ...buildQueryOptions({
      staleTime: 20 * 1000,
      refetchOnWindowFocus: true,
    }),
    placeholderData: (prev) => prev,
  });

  const rows = useMemo(() => data?.results ?? [], [data?.results]);
  const total = data?.count ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Buscar por nombre…"
            className="w-full border border-nodo-border rounded-xl pl-9 pr-3 py-2 bg-white text-nodo-text placeholder:text-nodo-legajo-subtitle"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">🔎</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-nodo-border bg-white overflow-hidden shadow-md">
        <div className={`px-4 py-3 text-xs uppercase tracking-wide bg-slate-50 text-nodo-legajo-subtitle ${cols}`}>
          <div>Nombre</div>
          <div>Estado</div>
          <div>Creado</div>
          <div>Actualizado</div>
          <div></div>
        </div>

        {isLoading ? (
          <SkeletonRows />
        ) : error ? (
          <ErrorState />
        ) : rows.length === 0 ? (
          <EmptyState onCreate={() => router.push(`/legajos/nuevo/crear?formId=${formId}`)} />
        ) : (
          <div className="divide-y">
            {rows.map((row: any) => (
              <Row
                key={row.id}
                data={row}
                onVer={() => router.push(`/legajos/${row.id}`)}
                onEditar={() => router.push(`/legajos/${row.id}/editar`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer paginación */}
      <div className="flex items-center justify-between text-sm text-nodo-text">
        <div className="text-nodo-legajo-subtitle">{isFetching ? 'Actualizando…' : `${total} resultados`}</div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded border border-nodo-border text-nodo-text disabled:opacity-50"
          >
            Anterior
          </button>
          <div className="px-2 py-1">
            {page} / {totalPages}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded border border-nodo-border text-nodo-text disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  data,
  onVer,
  onEditar,
}: {
  data: any;
  onVer: () => void;
  onEditar: () => void;
}) {
  const nombre = guessDisplay(data);
  const estado = data.estado || 'ACTIVO';
  const creado = formatDate(data.created_at);
  const actualizado = formatDate(data.updated_at);

  return (
    <div className={`px-4 py-3 ${cols}`}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 grid place-items-center rounded-lg bg-primary-pink/10">👤</div>
        <div>
          <div className="font-bold text-nodo-legajo-name">{nombre}</div>
          <div className="text-xs text-nodo-legajo-subtitle">ID: {data.id}</div>
          <div className="mt-2 flex gap-2">
            <button onClick={onVer} className="text-xs px-2 py-1 rounded border border-nodo-border text-nodo-text hover:bg-slate-50">
              Ver
            </button>
            <button onClick={onEditar} className="text-xs px-2 py-1 rounded border border-nodo-border text-nodo-text hover:bg-slate-50">
              Editar
            </button>
            <SendToFlowButton legajoId={data.id} />
          </div>
        </div>
      </div>
      <div>
        <span className={`px-2 py-1 rounded-full text-xs ${estado === 'ACTIVO' ? 'bg-primary-pink/10 text-primary-pink' : 'bg-gray-200 text-gray-700'}`}>
          {estado}
        </span>
      </div>
      <div className="text-sm text-nodo-text">{creado}</div>
      <div className="text-sm text-nodo-text">{actualizado}</div>
      <div></div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-3 animate-pulse grid grid-cols-[1fr_120px_160px_120px_40px] gap-[20px] items-center"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 w-40 bg-slate-200 rounded" />
              <div className="h-2 w-24 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-6 w-20 bg-slate-200 rounded-full" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div />
        </div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto mb-3 w-14 h-14 rounded-2xl grid place-items-center bg-red-100">❌</div>
      <h3 className="text-lg font-semibold text-nodo-title mb-1">Error al cargar</h3>
      <p className="text-sm text-nodo-legajo-subtitle">No se pudieron cargar los legajos. Intenta nuevamente.</p>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto mb-3 w-14 h-14 rounded-2xl grid place-items-center bg-primary-pink/10">📋</div>
      <h3 className="text-lg font-semibold text-nodo-title mb-1">No hay legajos</h3>
      <p className="text-sm opacity-70 mb-4">Crea el primer legajo con esta plantilla.</p>
      <button onClick={onCreate} className="px-5 py-2 rounded-xl bg-primary-gradient text-white font-medium text-lg hover:brightness-110">
        + Crear legajo
      </button>
    </div>
  );
}
