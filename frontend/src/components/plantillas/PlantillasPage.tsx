'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlantillasService } from '@/lib/services/plantillas';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import DeleteConfirm from './DeleteConfirm';
import { HoverCard } from '@/components/ui/hover-card';
import { FloatingButton } from '@/components/ui/floating-button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { buildQueryOptions } from '@/lib/queryDefaults';

type Estado = 'TODAS' | 'ACTIVO' | 'INACTIVO';
const cols = 'grid grid-cols-5 gap-4 items-center';

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
    ...buildQueryOptions({
      staleTime: 45 * 1000,
      refetchOnWindowFocus: true,
    }),
  });

  const { showToast } = useToast();

  const del = useMutation({
    mutationFn: (id: string) => PlantillasService.deletePlantilla(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plantillas', 'list'] });
      setToDelete(null);
      showToast('Plantilla eliminada correctamente', 'success');
    },
    onError: () => {
      showToast('Error al eliminar la plantilla', 'error');
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plantillas', 'list'] });
      showToast('Plantilla duplicada correctamente', 'success');
    },
    onError: () => {
      showToast('Error al duplicar la plantilla', 'error');
    },
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
        <div className={`px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 ${cols}`}>
          <div>Plantilla</div>
          <div>Versión</div>
          <div>Actualizado</div>
          <div>Estado</div>
          <div>Acciones</div>
        </div>


        {isLoading ? (
          <SkeletonRows />
        ) : results.length === 0 ? (
          <EmptyState onCreate={() => router.push('/plantillas/crear')} />
        ) : (
          <div className="p-4 space-y-4">
            {results.map((p: any) => (
              <HoverCard key={p.id} className="p-6">
                <Row
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
              </HoverCard>
            ))}
          </div>
        )}
      </div>

      {/* Footer paginación */}
      <div className="flex items-center justify-between text-sm">
        <div className="opacity-70 dark:text-gray-300">{isFetching ? 'Actualizando…' : `${total} resultados`}</div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded border disabled:opacity-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700"
          >
            Anterior
          </button>
          <div className="px-2 py-1 dark:text-gray-300">
            {page} / {totalPages}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded border disabled:opacity-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingButton 
        onClick={() => router.push('/plantillas/crear')}
      />

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
    <div className={`px-6 py-5 ${cols}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 grid place-items-center rounded-lg bg-sky-100 dark:bg-sky-900">📄</div>
        <div>
          <div className="font-medium text-base dark:text-white mb-1">{data.nombre}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{data.descripcion || '—'}</div>
        </div>
      </div>
      
      <div className="text-sm font-medium dark:text-gray-300">v{data.version ?? 1}</div>
      
      <div className="text-sm dark:text-gray-300">{fecha}</div>
      
      <div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
          {estado}
        </span>
      </div>
      
      <div className="flex gap-2">
        <button onClick={onEditar} className="text-sm px-3 py-1.5 rounded border dark:border-slate-600 dark:hover:bg-slate-700 dark:text-gray-300 hover:bg-gray-50">
          Editar
        </button>
        <button onClick={onPreview} className="text-sm px-3 py-1.5 rounded border dark:border-slate-600 dark:hover:bg-slate-700 dark:text-gray-300 hover:bg-gray-50">
          Preview
        </button>
        <button onClick={onUsar} className="text-sm px-3 py-1.5 rounded border dark:border-slate-600 dark:hover:bg-slate-700 dark:text-gray-300 hover:bg-gray-50">
          Usar
        </button>
        <button onClick={onEliminar} className="text-sm px-3 py-1.5 rounded border text-red-600 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-red-400 hover:bg-red-50">
          Eliminar
        </button>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto mb-3 w-14 h-14 rounded-2xl grid place-items-center bg-sky-100">✨</div>
      <h3 className="text-lg font-semibold mb-1 dark:text-white">No hay plantillas</h3>
      <p className="text-sm opacity-70 mb-4 dark:text-gray-300">Crea tu primera plantilla para empezar a cargar legajos.</p>
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
