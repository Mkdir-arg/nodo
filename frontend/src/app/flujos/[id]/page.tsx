import FlowEditor from '@/components/flows/FlowEditor';

interface FlowPageProps {
  params: { id: string };
}

export default function FlowPage({ params }: FlowPageProps) {
  return <FlowEditor flowId={params.id} />;
}