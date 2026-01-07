import { redirect } from 'next/navigation';

export default function EditarPlantillaPage() {
  // Redirigir a la lista de plantillas si no hay ID
  redirect('/plantillas');
}