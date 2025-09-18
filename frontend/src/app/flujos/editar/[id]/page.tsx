import FlowEditor from '@/components/flows/FlowEditor';

interface EditFlowPageProps {
  params: {
    id: string;
  };
}

export default function EditFlowPage({ params }: EditFlowPageProps) {
  return <FlowEditor flowId={params.id} />;
}