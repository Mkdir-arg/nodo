'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlantillasService } from '@/lib/services/plantillas';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import DeleteConfirm from './DeleteConfirm';

type Estado = 'TODAS' | 'ACTIVO' | 'INACTIVO';
const cols = 'grid grid-cols-[1fr_120px_160px_120px_40px] gap-4 items-center';

export default function PlantillasPage() {
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const dq = useDebouncedValue(q, 300);
  const [estado, setEstado] = useState<Estado>('TODAS');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<{ id: string; nombre: string } | null>(null);

  useEffect(() => {
    if (params.get('created') === '1') {
      console.log('Plantilla creada con éxito');
      history.replaceState(null, '', '/plantillas');
    }
  }, [params]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['plantillas', 'list', { dq, estado, page }],
    queryFn: () =>
      PlantillasService.fetchPlantillas({
        search: dq || undefined,
        estado: estado === 'TODAS' ? undefined : estado,
        page,
        page_size: 10,
      }),
    placeholderData: keepPreviousData,
  });

  const del = useMutation({
    mutationFn: (id: string) => PlantillasService.deletePlantilla(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plantillas', 'list'] });
      setToDelete(null);
    },
  });

  const duplicar = useMutation({
    mutationFn: async (tpl: any) => {
      const nombre = `${tpl.nombre} (copia)`;
      return PlantillasService.savePlantilla({
        nombre,
        descripcion: tpl.descripcion || null,
        schema: tpl.schema,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plantillas', 'list'] }),
  });

  const results = (data as any)?.results ?? [];
  const total = (data as any)?.count ?? results.length;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Plantillas</h1>
          <p className="text-sm opacity-70">
            Diseñá, previsualizá y administrá las plantillas de legajos.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/plantillas/crear')}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:brightness-110"
          >
            + Crear plantilla
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full border rounded-xl pl-9 pr-3 py-2 dark:bg-slate-900 dark:border-slate-700"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">🔎</span>
        </div>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as Estado);
            setPage(1);
          }}
          className="border rounded-xl px-3 py-2 w-full md:w-48 dark:bg-slate-900 dark:border-slate-700"
        >
          <option value="TODAS">Todas</option>
          <option value="ACTIVO">Activas</option>
          <option value="INACTIVO">Inactivas</option>
        </select>
      </div>

      {/* Tabla / Empty / Loader */}
      <div className="rounded-2xl border bg-white overflow-hidden dark:bg-slate-800 dark:border-slate-700">
        <div className={`px-4 py-3 text-xs uppercase tracking-wide bg-gray-50 dark:bg-slate-700 ${cols}`}>
          <div>Nombre</div>
          <div>Versión</div>
          <div>Actualizado</div>
          <div>Estado</div>
          <div></div>
        </div>

        {isLoading ? (
          <SkeletonRows />
        ) : results.length === 0 ? (
          <EmptyState onCreate={() => router.push('/plantillas/crear')} />
        ) : (
          <div className="divide-y">
            {results.map((p: any) => (
              <Row
                key={p.id}
                data={p}
                onEditar={() => router.push(`/plantillas/editar/${p.id}`)}
                onPreview={() => {
                  try {
                    localStorage.setItem('nodo.plantilla.preview', JSON.stringify(p.schema));
                  } catch {}
                  window.open('/plantillas/previsualizacion', '_blank');
                }}
                onUsar={() => router.push(`/legajos/nuevo?formId=${p.id}`)}
                onDuplicar={() => duplicar.mutate(p)}
                onEliminar={() => setToDelete({ id: p.id, nombre: p.nombre })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer paginación */}
      <div className="flex items-center justify-between text-sm">
        <div className="opacity-70">{isFetching ? 'Actualizando…' : `${total} resultados`}</div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded border disabled:opacity-50 dark:border-slate-700"
          >
            Anterior
          </button>
          <div className="px-2 py-1">
            {page} / {totalPages}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded border disabled:opacity-50 dark:border-slate-700"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal borrar */}
      <DeleteConfirm
        open={!!toDelete}
        title="Eliminar plantilla"
        message={`¿Eliminar "${toDelete?.nombre}"? Esto la desactivará para nuevos legajos.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && del.mutate(toDelete.id)}
        loading={del.isPending}
      />
    </div>
  );
}

function Row({
  data,
  onEditar,
  onPreview,
  onUsar,
  onDuplicar,
  onEliminar,
}: {
  data: any;
  onEditar: () => void;
  onPreview: () => void;
  onUsar: () => void;
  onDuplicar: () => void;
  onEliminar: () => void;
}) {
  const fecha = formatDate(data.updated_at || data.updatedAt || data.updated || data.created_at);
  const estado = String(data.estado || 'ACTIVO').toUpperCase();
  return (
    <div className={`px-4 py-3 ${cols}`}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 grid place-items-center rounded-lg bg-sky-100 dark:bg-sky-900">📄</div>
        <div>
          <div className="font-medium">{data.nombre}</div>
          <div className="text-xs opacity-60">{data.descripcion || '—'}</div>
          <div className="mt-2 flex gap-2">
            <button onClick={onEditar} className="text-xs px-2 py-1 rounded border dark:border-slate-700 dark:hover:bg-slate-700">
              Editar
            </button>
            <button onClick={onPreview} className="text-xs px-2 py-1 rounded border dark:border-slate-700 dark:hover:bg-slate-700">
              Previsualizar
            </button>
            <button onClick={onUsar} className="text-xs px-2 py-1 rounded border dark:border-slate-700 dark:hover:bg-slate-700">
              Usar
            </button>
            <button onClick={onDuplicar} className="text-xs px-2 py-1 rounded border dark:border-slate-700 dark:hover:bg-slate-700">
              Duplicar
            </button>
            <button
              onClick={onEliminar}
              className="text-xs px-2 py-1 rounded border text-red-600 dark:border-slate-700 dark:hover:bg-slate-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
      <div className="text-sm tabular-nums">v{data.version ?? 1}</div>
      <div className="text-sm">{fecha}</div>
      <div>
        <span className={`px-2 py-1 rounded-full text-xs ${estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
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
          className="px-4 py-3 animate-pulse grid grid-cols-[1fr_120px_160px_120px_40px] gap-4 items-center"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 w-40 bg-slate-200 rounded" />
              <div className="h-2 w-24 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-3 w-8 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-6 w-20 bg-slate-200 rounded-full" />
          <div />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto mb-3 w-14 h-14 rounded-2xl grid place-items-center bg-sky-100">✨</div>
      <h3 className="text-lg font-semibold mb-1">No hay plantillas</h3>
      <p className="text-sm opacity-70 mb-4">Crea tu primera plantilla para empezar a cargar legajos.</p>
      <button onClick={onCreate} className="px-4 py-2 rounded-xl bg-sky-600 text-white">
        + Crear plantilla
      </button>
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
