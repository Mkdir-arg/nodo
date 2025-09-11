'use client';

import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['example'],
    queryFn: () => fetcher<{ message: string }>('/example'),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading dashboard</p>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
