import { useState } from 'react';
import { RelationComponent, RelationConfig, RelatedRecord } from './components/relation-component';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

// Mock data
const mockProjects: RelatedRecord[] = [
  { 
    id: '1', 
    nombre: 'Sistema CRM', 
    fecha_inicio: '15 Ene 2024', 
    estado: 'En Progreso',
    codigo: 'CRM-001'
  },
  { 
    id: '2', 
    nombre: 'App Mobile', 
    fecha_inicio: '01 Mar 2024', 
    estado: 'Completado',
    codigo: 'APP-002'
  },
  { 
    id: '3', 
    nombre: 'Portal Web', 
    fecha_inicio: '10 Feb 2024', 
    estado: 'En Progreso',
    codigo: 'WEB-003'
  },
];

const allProjects: RelatedRecord[] = [
  ...mockProjects,
  { 
    id: '4', 
    nombre: 'Dashboard Analytics', 
    fecha_inicio: '05 Abr 2024', 
    estado: 'Planificación',
    codigo: 'DAS-004'
  },
  { 
    id: '5', 
    nombre: 'E-commerce Platform', 
    fecha_inicio: '20 Mar 2024', 
    estado: 'En Progreso',
    codigo: 'ECO-005'
  },
  { 
    id: '6', 
    nombre: 'API Gateway', 
    fecha_inicio: '12 Ene 2024', 
    estado: 'Completado',
    codigo: 'API-006'
  },
  { 
    id: '7', 
    nombre: 'Microservicios Backend', 
    fecha_inicio: '18 Feb 2024', 
    estado: 'En Progreso',
    codigo: 'MSV-007'
  },
];

const config: RelationConfig = {
  title: 'Proyectos Asignados',
  description: 'Proyectos en los que participa el empleado',
  allow_create: true,
  allow_remove: true,
  display_fields: ['nombre', 'fecha_inicio', 'estado'],
  search_fields: ['nombre', 'codigo'],
};

export default function App() {
  const [relatedRecords, setRelatedRecords] = useState<RelatedRecord[]>(mockProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

  const handleSearch = async (query: string): Promise<RelatedRecord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = allProjects.filter((project) => {
          const searchLower = query.toLowerCase();
          return (
            project.nombre.toLowerCase().includes(searchLower) ||
            project.codigo.toLowerCase().includes(searchLower)
          );
        });
        resolve(results);
      }, 500);
    });
  };

  const handleAdd = (recordId: string) => {
    const record = allProjects.find(p => p.id === recordId);
    if (record && !relatedRecords.find(r => r.id === recordId)) {
      setRelatedRecords([...relatedRecords, record]);
    }
  };

  const handleRemove = (recordId: string) => {
    setRelatedRecords(relatedRecords.filter(r => r.id !== recordId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative">
        <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
          {/* Hero Header */}
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-lg rounded-full px-4 py-2 shadow-lg">
              <span className="inline-block w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Componente UI</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              ui:relation
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Gestiona relaciones entre legajos de diferentes plantillas con un diseño moderno hero-glass
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-2 shadow-xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 rounded-xl p-1 gap-1">
                <TabsTrigger 
                  value="create"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                >
                  Modo Creación
                </TabsTrigger>
                <TabsTrigger 
                  value="edit"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                >
                  Modo Edición
                </TabsTrigger>
                <TabsTrigger 
                  value="view"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                >
                  Modo Vista
                </TabsTrigger>
              </TabsList>

              {/* Create Mode */}
              <TabsContent value="create" className="mt-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">Estado Deshabilitado</h2>
                  </div>
                  <p className="text-sm text-gray-600 pl-3">
                    El componente se desactiva hasta que el legajo sea guardado por primera vez
                  </p>
                </div>
                <RelationComponent
                  config={config}
                  mode="create"
                  relatedRecords={[]}
                />
              </TabsContent>

              {/* Edit Mode */}
              <TabsContent value="edit" className="mt-6 space-y-12">
                {/* With Data */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">Estado Funcional</h2>
                  </div>
                  <p className="text-sm text-gray-600 pl-3">
                    Busca y agrega proyectos, elimina relaciones existentes
                  </p>
                  <RelationComponent
                    config={config}
                    mode="edit"
                    relatedRecords={relatedRecords}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                  />
                </div>

                {/* Empty State */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">Estado Vacío</h2>
                  </div>
                  <p className="text-sm text-gray-600 pl-3">
                    Cuando no hay relaciones asignadas
                  </p>
                  <RelationComponent
                    config={config}
                    mode="edit"
                    relatedRecords={[]}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onSearch={handleSearch}
                  />
                </div>

                {/* Loading State */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">Estado Cargando</h2>
                  </div>
                  <p className="text-sm text-gray-600 pl-3">
                    Skeleton loaders con efecto glass mientras cargan los datos
                  </p>
                  <RelationComponent
                    config={config}
                    mode="edit"
                    relatedRecords={mockProjects}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onSearch={handleSearch}
                    isLoading={true}
                  />
                </div>
              </TabsContent>

              {/* View Mode */}
              <TabsContent value="view" className="mt-6 space-y-12">
                {/* With Data */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">Solo Lectura</h2>
                  </div>
                  <p className="text-sm text-gray-600 pl-3">
                    Sin botones de acción, no se puede modificar
                  </p>
                  <RelationComponent
                    config={config}
                    mode="view"
                    relatedRecords={relatedRecords}
                  />
                </div>

                {/* Empty */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">Vista Vacía</h2>
                  </div>
                  <p className="text-sm text-gray-600 pl-3">
                    Vista de solo lectura sin relaciones
                  </p>
                  <RelationComponent
                    config={config}
                    mode="view"
                    relatedRecords={[]}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Configuration Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
              <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
              <pre className="text-sm text-gray-100 font-mono">
{`{
  "type": "ui:relation",
  "config": {
    "title": "Proyectos Asignados",
    "description": "Proyectos en los que participa el empleado",
    "allow_create": true,
    "allow_remove": true,
    "display_fields": ["nombre", "fecha_inicio", "estado"],
    "search_fields": ["nombre", "codigo"]
  }
}`}
              </pre>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Búsqueda Inteligente</h3>
              <p className="text-sm text-gray-600">
                Busca registros en tiempo real con resultados instantáneos
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Glass Morphism</h3>
              <p className="text-sm text-gray-600">
                Diseño moderno con efectos de vidrio esmerilado y degradados
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Responsive</h3>
              <p className="text-sm text-gray-600">
                Adaptable a cualquier tamaño de pantalla y dispositivo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
