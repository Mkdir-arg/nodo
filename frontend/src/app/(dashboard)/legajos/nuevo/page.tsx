import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import DynamicForm from '@/components/runtime/DynamicForm';

export default function NewRecordPage() {
  const { data } = useQuery({ queryKey: ['templates'], queryFn: () => api.get('/templates/').then(res => res.data) });
  if (!data) return <div>Sin plantillas</div>;
  const template = data[0];
  return <DynamicForm template={template} onSubmit={(d)=>api.post('/records/', d)} />;
}
