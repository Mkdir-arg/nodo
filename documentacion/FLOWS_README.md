# Sistema de Gestión de Flujos

## Descripción

El sistema de gestión de flujos permite a los usuarios crear, editar y ejecutar flujos de trabajo personalizados compuestos por múltiples pasos secuenciales. Cada paso puede configurarse con diferentes tipos de acciones como envío de emails, peticiones HTTP, operaciones de base de datos, etc.

## Funcionalidades Implementadas

### Frontend (React/Next.js)

1. **Navegación**
   - Nueva entrada "Flujos" en el menú lateral
   - Rutas configuradas: `/flujos`, `/flujos/nuevo`, `/flujos/editar/[id]`

2. **Listado de Flujos**
   - Vista de todos los flujos del usuario
   - Información básica: nombre, descripción, número de pasos, fechas
   - Acciones: Editar, Eliminar, Crear nuevo

3. **Editor de Flujos**
   - Formulario para nombre y descripción del flujo
   - Canvas visual para diseñar el flujo
   - Gestión de pasos: agregar, editar, eliminar
   - Conexiones visuales entre pasos

4. **Configuración de Pasos**
   - Formulario dinámico según el tipo de acción
   - Tipos de acción soportados:
     - **Email**: destinatario, asunto, cuerpo
     - **HTTP**: URL, método, headers, body
     - **Delay**: duración y unidad de tiempo
     - **Condición**: expresión booleana para bifurcación
     - **Base de Datos**: tabla, operación, datos
     - **Transformación**: entrada, transformación, salida

5. **Estado Global**
   - Store Zustand para gestión de flujos
   - Integración con API backend
   - Manejo de estados de carga y errores

### Backend (Django/DRF)

1. **Modelos**
   - `Flow`: flujo principal con pasos almacenados como JSON
   - `FlowExecution`: registro de ejecuciones de flujos

2. **API REST**
   - CRUD completo para flujos
   - Endpoints para ejecución de flujos
   - Filtros y permisos por usuario

3. **Serializers**
   - Serialización de flujos y ejecuciones
   - Validación de datos de entrada

## Instalación y Configuración

### Dependencias Requeridas

**Frontend:**
```bash
npm install reactflow  # Para el canvas visual de flujos
```

**Backend:**
Las dependencias ya están incluidas en el proyecto (Django, DRF, etc.)

### Configuración

1. **Backend:**
   - La app `flows` ya está agregada a `INSTALLED_APPS`
   - URLs configuradas en el routing principal
   - Ejecutar migraciones: `python manage.py makemigrations flows && python manage.py migrate`

2. **Frontend:**
   - Los componentes y rutas están configurados
   - El store está integrado con la API

## Estructura de Archivos

### Frontend
```
src/
├── lib/
│   ├── flows/
│   │   └── types.ts              # Tipos e interfaces
│   ├── store/
│   │   └── useFlowStore.ts       # Store Zustand
│   └── api/
│       └── flows.ts              # Cliente API
├── components/
│   └── flows/
│       ├── FlowsPage.tsx         # Página principal
│       ├── FlowList.tsx          # Lista de flujos
│       ├── FlowEditor.tsx        # Editor de flujos
│       ├── FlowCanvas.tsx        # Canvas visual
│       └── StepForm.tsx          # Formulario de pasos
└── app/
    └── flujos/
        ├── page.tsx              # Ruta principal
        ├── nuevo/
        │   └── page.tsx          # Crear flujo
        └── editar/
            └── [id]/
                └── page.tsx      # Editar flujo
```

### Backend
```
backend/
└── flows/
    ├── models.py                 # Modelos de datos
    ├── serializers.py            # Serializers DRF
    ├── viewsets.py               # ViewSets API
    ├── urls.py                   # URLs de la app
    ├── admin.py                  # Configuración admin
    └── apps.py                   # Configuración app
```

## Uso

1. **Acceder a Flujos**: Navegar a la sección "Flujos" desde el menú lateral
2. **Crear Flujo**: Hacer clic en "Nuevo Flujo"
3. **Configurar Flujo**: Ingresar nombre y descripción
4. **Agregar Pasos**: Usar el botón "Agregar paso" en el canvas
5. **Configurar Acciones**: Seleccionar tipo de acción y completar parámetros
6. **Guardar**: Usar el botón "Guardar Flujo"

## Próximas Mejoras

1. **Ejecución de Flujos**: Implementar motor de ejecución real
2. **React Flow**: Integrar biblioteca completa para canvas avanzado
3. **Validaciones**: Mejorar validaciones de formularios
4. **Notificaciones**: Sistema de notificaciones para operaciones
5. **Historial**: Registro detallado de ejecuciones
6. **Plantillas**: Flujos predefinidos como plantillas
7. **Condiciones Avanzadas**: Editor visual para condiciones complejas

## Notas Técnicas

- Los pasos se almacenan como JSON en la base de datos para flexibilidad
- El canvas actual es una implementación simple; se recomienda React Flow para funcionalidad avanzada
- La ejecución de flujos está preparada pero requiere implementación del motor de ejecución
- Todos los flujos están asociados al usuario que los crea (multi-tenant)