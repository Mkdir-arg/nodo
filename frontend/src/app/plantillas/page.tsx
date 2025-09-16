import PlantillasPage from '@/components/plantillas/PlantillasPage';
import { PageTransition } from '@/components/ui/page-transition';

export default function Page() {
  return (
    <PageTransition>
      <PlantillasPage />
    </PageTransition>
  );
}

