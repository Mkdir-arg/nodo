import Builder from '@/components/builder/Builder';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function EditTemplatePage() {
  const params = useParams();
  const id = params?.id as string;
  const { data } = useQuery({ queryKey: ['template', id], queryFn: () => api.get(`/templates/${id}/`).then(res => res.data), enabled: !!id });
  if (!data) return <div>Cargando...</div>;
  return <Builder template={data} />;
}
