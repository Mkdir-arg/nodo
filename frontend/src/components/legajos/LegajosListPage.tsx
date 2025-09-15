'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { LegajosService } from '@/lib/services/legajos';
import { PlantillasService } from '@/lib/services/plantillas';

const cols = 'grid grid-cols-[1fr_200px_160px_120px_40px] gap-4 items-center';
const PAGE_SIZE = 10;
const ALL_PLANTILLAS = 'ALL';

type LegajoRow = {
  id: string;
  display: string | null;
  estado: string | null;
  plantilla_id: string;
  created_at: string | null;
  updated_at: string | null;
  data: Record<string, any> | null;
};

type LegajosListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: LegajoRow[];
};

type PlantillaOption = {
  id: string;
  nombre: string;
};

export default function LegajosListPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [plantillaId, setPlantillaId] = useState<string>(ALL_PLANTILLAS);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    const formId = params.get('formId');
    const next = formId ?? ALL_PLANTILLAS;
    setPlantillaId((prev) => {
      if (prev !== next) {
        setPage(1);
      }
      return next;
    });
  }, [params]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<LegajosListResponse>({
    queryKey: ['legajos', { search: debouncedSearch, plantillaId, page }],
    queryFn: async () => {
      const res: any = await LegajosService.list({
        formId: plantillaId === ALL_PLANTILLAS ? undefined : plantillaId,
        search: debouncedSearch || undefined,
        page,
        page_size: PAGE_SIZE,
      });

      const normalizeRow = (row: any): LegajoRow => ({
        id: String(row?.id ?? ''),
        display: row?.display ?? null,
        estado: row?.estado ?? null,
        plantilla_id: String(row?.plantilla_id ?? row?.plantilla ?? ''),
        created_at: row?.created_at ?? row?.createdAt ?? row?.created ?? null,
        updated_at: row?.updated_at ?? row?.updatedAt ?? row?.updated ?? null,
        data: (row?.data && typeof row.data === 'object') ? row.data : null,
      });

      if (Array.isArray(res)) {
        return {
          count: res.length,
          next: null,
          previous: null,
          results: res.map(normalizeRow),
        } satisfies LegajosListResponse;
      }

      const rawResults = Array.isArray(res?.results) ? res.results : [];
      const parsedCount = typeof res?.count === 'number'
        ? res.count
        : Number.parseInt(res?.count ?? '', 10);

      return {
        count: Number.isFinite(parsedCount) ? parsedCount : rawResults.length,
        next: typeof res?.next === 'string' ? res.next : null,
        previous: typeof res?.previous === 'string' ? res.previous : null,
        results: rawResults.map(normalizeRow),
      } satisfies LegajosListResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const { data: plantillas = [] } = useQuery<PlantillaOption[]>({
    queryKey: ['plantillas', 'legajos-options'],
    queryFn: async () => {
      const res: any = await PlantillasService.fetchPlantillas({ page_size: 200 });
      const raw = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      return raw.map((item: any) => ({
        id: String(item?.id ?? ''),
        nombre: item?.nombre ?? 'Sin nombre',
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const plantillaMap = useMemo(() => {
    const map = new Map<string, string>();
    plantillas.forEach((p) => {
      map.set(String(p.id), p.nombre);
    });
    return map;
  }, [plantillas]);

  const handlePlantillaChange = (value: string) => {
    setPlantillaId(value);
    setPage(1);
    const nextParams = new URLSearchParams(params.toString());
    if (value === ALL_PLANTILLAS) {
      nextParams.delete('formId');
    } else {
      nextParams.set('formId', value);
    }
    const qs = nextParams.toString();
    router.replace(`/legajos${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreate = () => {
    if (plantillaId === ALL_PLANTILLAS) return;
    router.push(`/legajos/nuevo?formId=${plantillaId}`);
  };

  const results = data?.results ?? [];
  const total = !error ? data?.count ?? results.length : 0;
  const totalPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));

  useEffect(() => {
    if (!data) return;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [data, page, totalPages]);

  const canCreate = plantillaId !== ALL_PLANTILLAS;
  const hasError = Boolean(error);
  const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error al cargar los legajos.';

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Legajos</h1>
          <p className="text-sm opacity-70">Gestioná y revisá los legajos cargados.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            title={canCreate ? undefined : 'Seleccioná una plantilla para crear un legajo'}
            className={`px-4 py-2 rounded-xl text-white transition ${
              canCreate
                ? 'bg-sky-600 hover:brightness-110'
                : 'bg-slate-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            + Crear legajo
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full border rounded-xl pl-9 pr-3 py-2 dark:bg-slate-900 dark:border-slate-700"
            type="search"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">🔎</span>
        </div>
        <select
          value={plantillaId}
          onChange={(e) => handlePlantillaChange(e.target.value)}
          className="border rounded-xl px-3 py-2 w-full md:w-56 dark:bg-slate-900 dark:border-slate-700"
        >
          <option value={ALL_PLANTILLAS}>Todas las plantillas</option>
          {plantillas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border bg-white overflow-hidden dark:bg-slate-800 dark:border-slate-700">
        <div className={`px-4 py-3 text-xs uppercase tracking-wide bg-gray-50 dark:bg-slate-700 ${cols}`}>
          <div>Legajo</div>
          <div>Plantilla</div>
          <div>Actualizado</div>
          <div>Estado</div>
          <div></div>
        </div>

        {isLoading ? (
          <SkeletonRows />
        ) : hasError ? (
          <ErrorState message={errorMessage} onRetry={refetch} />
        ) : results.length === 0 ? (
          <EmptyState onCreate={handleCreate} canCreate={canCreate} />
        ) : (
          <div className="divide-y">
            {results.map((row) => (
              <Row
                key={row.id}
                data={row}
                plantillaNombre={plantillaMap.get(row.plantilla_id) ?? row.plantilla_id}
                onVer={() => router.push(`/legajos/${row.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="opacity-70">
          {hasError ? 'No se pudieron cargar los resultados' : isFetching ? 'Actualizando…' : `${total} resultados`}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1 || hasError}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded border disabled:opacity-50 dark:border-slate-700"
          >
            Anterior
          </button>
          <div className="px-2 py-1">
            {page} / {totalPages}
          </div>
          <button
            disabled={page >= totalPages || hasError}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded border disabled:opacity-50 dark:border-slate-700"
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
  plantillaNombre,
  onVer,
}: {
  data: LegajoRow;
  plantillaNombre?: string;
  onVer: () => void;
}) {
  const actualizado = formatDate(data.updated_at || undefined);
  const creado = formatDate(data.created_at || undefined);
  const estado = data.estado ? String(data.estado).toUpperCase() : '—';
  const display = guessDisplay(data);

  return (
    <div className={`px-4 py-3 ${cols}`}>
      <div className="flex items-start gap-2">
        <div className="w-9 h-9 grid place-items-center rounded-lg bg-indigo-100 dark:bg-indigo-900">🗂️</div>
        <div>
          <div className="font-medium leading-tight">{display}</div>
          <div className="text-xs opacity-60">Creado {creado}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={onVer}
              className="text-xs px-2 py-1 rounded border dark:border-slate-700 dark:hover:bg-slate-700"
            >
              Ver detalle
            </button>
          </div>
        </div>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-300">{plantillaNombre}</div>
      <div className="text-sm">{actualizado}</div>
      <div>
        <span className={`px-2 py-1 rounded-full text-xs ${estadoBadgeClass(estado)}`}>
          {estado}
        </span>
      </div>
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
          className="px-4 py-3 animate-pulse grid grid-cols-[1fr_200px_160px_120px_40px] gap-4 items-center"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 w-40 bg-slate-200 rounded" />
              <div className="h-2 w-24 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-3 w-28 bg-slate-200 rounded" />
          <div className="h-6 w-20 bg-slate-200 rounded-full" />
          <div />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onCreate, canCreate }: { onCreate: () => void; canCreate: boolean }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto mb-3 w-14 h-14 rounded-2xl grid place-items-center bg-indigo-100">🗂️</div>
      <h3 className="text-lg font-semibold mb-1">No hay legajos</h3>
      <p className="text-sm opacity-70 mb-4">
        {canCreate
          ? 'Crea tu primer legajo para empezar a gestionar la información.'
          : 'Seleccioná una plantilla para comenzar a crear legajos.'}
      </p>
      <button
        onClick={onCreate}
        disabled={!canCreate}
        className={`px-4 py-2 rounded-xl text-white ${
          canCreate
            ? 'bg-sky-600 hover:brightness-110'
            : 'bg-slate-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-300'
        }`}
      >
        + Crear legajo
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto mb-3 w-14 h-14 rounded-2xl grid place-items-center bg-red-100 text-red-600">⚠️</div>
      <h3 className="text-lg font-semibold mb-1">No se pudieron cargar los legajos</h3>
      <p className="text-sm opacity-70 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
      >
        Reintentar
      </button>
    </div>
  );
}

function guessDisplay(row: LegajoRow) {
  if (row.display) return row.display;
  const data = row.data || {};
  const candidates = [data, (data as any).ciudadano, (data as any).persona, (data as any).titular];
  for (const item of candidates) {
    if (item && typeof item === 'object') {
      const apellido = (item as any).apellido || (item as any).last_name || (item as any).apellidos;
      const nombre = (item as any).nombre || (item as any).first_name || (item as any).nombres;
      if (apellido && nombre) return `${apellido}, ${nombre}`;
      if (nombre) return nombre;
      if (apellido) return apellido;
    }
  }
  return row.id || '—';
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function estadoBadgeClass(estado: string) {
  const normalized = estado.toLowerCase();
  if (normalized === 'activo') return 'bg-emerald-100 text-emerald-800';
  if (['inactivo', 'archivado', 'cancelado'].includes(normalized)) {
    return 'bg-gray-200 text-gray-700';
  }
  if (['pendiente', 'en progreso', 'en curso'].includes(normalized)) {
    return 'bg-amber-100 text-amber-800';
  }
  if (!estado || estado === '—') {
    return 'bg-gray-200 text-gray-700';
  }
  return 'bg-sky-100 text-sky-800';
}
