import EditorClient from "./EditorClient";

export default function EditarPlantillaPage({ params }: { params: { id: string } }) {
  return <EditorClient plantillaId={params.id} />;
}
