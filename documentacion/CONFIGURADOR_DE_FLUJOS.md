# Configurador de Flujos - Documentacion Completa

## Indice

1. [Vision General](#vision-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Interfaz Visual - Como se Ve](#interfaz-visual)
4. [Los 9 Tipos de Nodos](#los-9-tipos-de-nodos)
5. [El Editor Visual (FlowCanvas)](#el-editor-visual)
6. [Configuracion de Cada Nodo](#configuracion-de-cada-nodo)
7. [Sistema de Conexiones y Transiciones](#sistema-de-conexiones)
8. [Validacion en Tiempo Real](#validacion-en-tiempo-real)
9. [Motor de Ejecucion (Runtime)](#motor-de-ejecucion)
10. [Modelo de Datos](#modelo-de-datos)
11. [API Endpoints](#api-endpoints)
12. [Ciclo de Vida Completo](#ciclo-de-vida-completo)
13. [Plantillas Predefinidas](#plantillas-predefinidas)
14. [Monitoreo de Ejecuciones](#monitoreo-de-ejecuciones)

---

## Vision General

El configurador de flujos de NODO es un sistema visual de tipo **drag-and-drop** que permite disenar, configurar y ejecutar workflows automatizados. Esta construido con:

- **Frontend**: Next.js + React + TypeScript + React Flow (libreria de grafos interactivos)
- **Backend**: Django + Python con un motor de ejecucion propio
- **Base de datos**: MySQL con almacenamiento JSON para configuraciones dinamicas

El sistema NO es un simple formulario secuencial. Es un **editor de grafos dirigidos** donde cada nodo tiene su propio tipo, configuracion y logica de ejecucion, y las conexiones entre nodos definen el flujo de trabajo.

---

## Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                    │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  FlowList   │  │  FlowEditor  │  │  FlowRuntime   │  │
│  │  (listado)  │  │  (diseno)    │  │  (ejecucion)   │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘  │
│         │                │                   │           │
│         │         ┌──────┴───────┐           │           │
│         │         │  FlowCanvas  │           │           │
│         │         │ (React Flow) │           │           │
│         │         └──────┬───────┘           │           │
│         │                │                   │           │
│  ┌──────┴────────────────┴───────────────────┴────────┐  │
│  │              useFlowStore (Zustand)                 │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              API Client (flows.ts)                  │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │ REST API
┌───────────────────────────┼──────────────────────────────┐
│                     BACKEND (Django)                      │
│                           │                              │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              FlujoViewSet (CRUD + acciones)         │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌──────────────┐  ┌──────┴──────┐  ┌────────────────┐  │
│  │ Serializers  │  │  FlowRuntime │  │   Scheduler    │  │
│  │ (validacion) │  │  (motor)     │  │   (delays)     │  │
│  └──────────────┘  └──────┬──────┘  └────────────────┘  │
│                           │                              │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              Nodes (9 tipos de nodos)               │  │
│  │  Start │ Form │ Evaluation │ Email │ HTTP │ Delay  │  │
│  │  Condition │ Database │ Transform                   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Models (MySQL + JSON)                  │  │
│  │  Flujo │ Step │ Transition │ InstanciaFlujo │ Log  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Interfaz Visual

### Pagina de Listado (`/flujos`)

La pagina principal muestra todos los flujos como **tarjetas (cards)** con:

```
┌──────────────────────────────────────────────────────────┐
│  Flujos de Trabajo                          [+ Nuevo Flujo]│
│  Gestiona y ejecuta tus flujos automatizados              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Proceso de Onboarding              [Activo]       │  │
│  │  Flujo para incorporar nuevos empleados            │  │
│  │  ⚡ 5 pasos   Creado 15/03/2026                    │  │
│  │                    [Ejecutar] [Editar] [Eliminar]  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Evaluacion Tecnica                 [Activo]       │  │
│  │  Evaluacion para candidatos de desarrollo          │  │
│  │  ⚡ 7 pasos   Creado 10/03/2026                    │  │
│  │                    [Ejecutar] [Editar] [Eliminar]  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Cada tarjeta tiene:
- **Nombre** del flujo en negrita
- **Badge de estado** ("Activo" en verde)
- **Descripcion** del flujo
- **Metadatos**: cantidad de pasos + fecha de creacion
- **Botones de accion**: Ejecutar (verde), Editar, Duplicar, Exportar, Eliminar (rojo)

Si no hay flujos, se muestra un **empty state** con un icono grande de workflow y un boton "Crear primer flujo".

---

### Pagina del Editor (`/flujos/nuevo` o `/flujos/editar/[id]`)

El editor es la pantalla principal del configurador. Se compone de varias secciones apiladas verticalmente:

#### 1. Header con Gradiente

```
┌──────────────────────────────────────────────────────────┐
│  ███████████████████ GRADIENTE AZUL-PURPURA ████████████ │
│                                                          │
│  [icono rayo]  Crear Nuevo Flujo                         │
│                Disena un flujo de trabajo paso a paso     │
│                                                          │
│                           [Cancelar] [Ejecutar] [Guardar]│
└──────────────────────────────────────────────────────────┘
```

- Fondo con **gradiente CSS** `from-blue-600 via-purple-600 to-indigo-700`
- Icono de rayo en cuadrado blanco semitransparente (backdrop-blur)
- Titulo dinamico: "Crear Nuevo Flujo" o "Editar Flujo"
- Botones: Cancelar (outline), Ejecutar (verde, solo en edicion), Guardar (blanco)
- El boton Guardar se **deshabilita** si hay errores de validacion y muestra `(N errores)`

#### 2. Seccion de Plantillas (solo en creacion)

```
┌──────────────────────────────────────────────────────────┐
│  FONDO AMBAR-NARANJA                                     │
│  [icono caja] Plantillas Predefinidas     [Ver Plantillas]│
│               Comienza rapido con flujos preconfigurados  │
│                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │ Bienvenida  │ │ Procesamiento│ │ Evaluacion  │        │
│  │ por Email   │ │ con         │ │ Tecnica     │        │
│  │             │ │ Validacion  │ │             │        │
│  │ 2 pasos     │ │ 4 pasos     │ │ 5 pasos     │        │
│  │ Usar -->    │ │ Usar -->    │ │ Usar -->    │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└──────────────────────────────────────────────────────────┘
```

- Card con gradiente ambar-naranja
- Grid responsive de 1-3 columnas con plantillas como tarjetas clickeables
- Cada plantilla muestra: nombre, descripcion (2 lineas max), cantidad de pasos
- Al hacer click se carga la plantilla completa (nombre, descripcion, pasos)
- Efecto hover: borde mas visible, sombra, translate-y-1 (se levanta)

#### 3. Configuracion Basica

```
┌──────────────────────────────────────────────────────────┐
│  FONDO GRADIENTE GRIS-BLANCO                             │
│  [icono doc] Configuracion Basica                        │
│              Define el nombre y descripcion               │
│                                                          │
│  ┌──────────────────────┐ ┌──────────────────────┐       │
│  │ Nombre del Flujo *   │ │ Descripcion          │       │
│  │ [__________________] │ │ [                   ]│       │
│  │ Elige un nombre      │ │ [                   ]│       │
│  │ descriptivo y unico  │ │ [___________________]│       │
│  └──────────────────────┘ └──────────────────────┘       │
└──────────────────────────────────────────────────────────┘
```

- Layout 2 columnas en desktop, 1 en mobile
- Input de nombre con borde que cambia a azul al enfocar
- Textarea de descripcion con resize deshabilitado
- Textos de ayuda debajo de cada campo

#### 4. Panel de Validacion

```
┌──────────────────────────────────────────────────────────┐
│  ✅ Flujo valido                                         │
└──────────────────────────────────────────────────────────┘

-- o si hay errores --

┌──────────────────────────────────────────────────────────┐
│  ⚠ Errores                                               │
│  • El flujo debe tener un nodo de inicio                 │
│  • Condicion "Validar": Rama 1 falta paso destino        │
│                                                          │
│  ⚠ Advertencias                                          │
│  • 2 paso(s) desconectado(s): Email, HTTP                │
│  • Multiples puntos finales detectados                   │
└──────────────────────────────────────────────────────────┘
```

El validador ejecuta en **tiempo real** las siguientes verificaciones:
- Exactamente 1 nodo Start
- Todos los pasos tienen nombre
- Nodos de condicion tienen al menos 1 rama con destino
- Nodos de email tienen destinatario
- Nodos HTTP tienen URL valida
- No hay ciclos en el grafo (deteccion DFS)
- No hay IDs duplicados
- No hay nodos huerfanos (desconectados)
- Advertencia si hay multiples puntos finales

#### 5. Disenador de Flujo (FlowCanvas) - EL COMPONENTE CENTRAL

```
┌──────────────────────────────────────────────────────────┐
│  [icono rayo] Disenador de Flujo           [ℹ 4 pasos]  │
│               Arrastra y conecta pasos                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  . . . . . . . . . . . . . . . . . . . . . . . .  │  │
│  │  .     ┌──────────────┐                         .  │  │
│  │  .     │ ▶ Inicio    1│                         .  │  │
│  │  .     │   start      │                         .  │  │
│  │  .     │      [✏][🗑] │                         .  │  │
│  │  .     └──────┬───────┘                         .  │  │
│  │  .            │ 1 -> 2                          .  │  │
│  │  .            ▼                                 .  │  │
│  │  .     ┌──────────────┐                         .  │  │
│  │  .     │ 📝 Formulario│2                        .  │  │
│  │  .     │   form       │                         .  │  │
│  │  .     │      [✏][🗑] │                         .  │  │
│  │  .     └──────┬───────┘                         .  │  │
│  │  .            │ 2 -> 3                          .  │  │
│  │  .            ▼                                 .  │  │
│  │  .     ┌──────────────┐      ┌──────────────┐  .  │  │
│  │  .     │ 🔀 Condicion 3│─────│ ✉ Email     4│  .  │  │
│  │  .     │   condition  │ Apro │   email      │  .  │  │
│  │  .     │      [✏][🗑] │──┐   │      [✏][🗑] │  .  │  │
│  │  .     └──────────────┘  │   └──────────────┘  .  │  │
│  │  .                       │ Rechazado            .  │  │
│  │  .                       ▼                      .  │  │
│  │  .                ┌──────────────┐              .  │  │
│  │  .                │ ✉ Rechazo   5│              .  │  │
│  │  .                │   email      │              .  │  │
│  │  .                │      [✏][🗑] │              .  │  │
│  │  .                └──────────────┘              .  │  │
│  │  . . . . . . . . . . . . . . . . . . . . . . . .  │  │
│  │                                                    │  │
│  │  [+ Agregar Paso]                    [-] [□] [+]   │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Detalles tecnicos del canvas:**
- Usa la libreria **React Flow** con fondo de puntos (`Background variant="dots"`)
- Cada nodo es un **CustomNode** con:
  - Handle de entrada (arriba) y salida (abajo) para conectar
  - Icono segun tipo (Play, Mail, Globe, Clock, GitBranch, Database, Shuffle)
  - Color de borde y fondo segun tipo (ver tabla abajo)
  - Nombre en negrita + tipo en texto pequeno
  - Numero de orden (badge azul circular)
  - Botones de editar (azul) y eliminar (rojo)
- Las conexiones son **lineas animadas** tipo `smoothstep` con:
  - Color indigo (`#6366f1`) para conexiones normales
  - Color naranja (`#f97316`) para ramas de condicion
  - Color gris (`#64748b`) con linea punteada para fallback
  - Labels con el numero de transicion (ej: "1 -> 2")
- Controles de zoom en esquina inferior derecha (React Flow Controls)
- Boton "Agregar Paso" fijo en esquina inferior izquierda
- Los nodos son **arrastrables** y guardan su posicion

**Colores de nodos:**

| Tipo        | Borde         | Fondo          | Icono       |
|-------------|---------------|----------------|-------------|
| start       | green-500     | green-50       | Play        |
| form        | gray-500      | gray-50        | Plus        |
| evaluation  | gray-500      | gray-50        | Plus        |
| email       | blue-500      | blue-50        | Mail        |
| http        | purple-500    | purple-50      | Globe       |
| delay       | yellow-500    | yellow-50      | Clock       |
| condition   | orange-500    | orange-50      | GitBranch   |
| database    | indigo-500    | indigo-50      | Database    |
| transform   | pink-500      | pink-50        | Shuffle     |

**Numeracion automatica:**
El canvas calcula automaticamente el orden de ejecucion usando BFS (Breadth-First Search) desde el nodo Start. Cada nodo muestra un badge circular azul con su numero de paso.

**Conexion de nodos:**
- Para nodos normales: arrastrar del handle inferior al handle superior del nodo destino
- Para nodos de condicion: al conectar se abre un **modal** (BranchConnectionModal) para elegir a cual rama asignar la conexion

---

## Los 9 Tipos de Nodos

### 1. Start (Inicio)
- **Proposito**: Punto de entrada del flujo. Muestra una tabla de legajos para seleccionar con cual iniciar.
- **Restriccion**: Solo puede haber 1 por flujo.
- **Config**: Plantilla aceptada, columnas de tabla, filtros, ordenamiento, paginacion.

### 2. Form (Formulario)
- **Proposito**: Captura datos del usuario con campos configurables.
- **Config**: Titulo, descripcion, lista de campos con tipo/label/required/placeholder/options.
- **Tipos de campo**: text, email, number, date, select, checkbox, textarea.
- **Los datos se guardan** en `context.forms.step_{id}` de la instancia.

### 3. Evaluation (Evaluacion)
- **Proposito**: Sistema de preguntas con puntaje y bifurcacion automatica segun resultado.
- **Config**: Titulo, preguntas con opciones ponderadas, rangos de puntuacion con categorias.
- **Tipos de pregunta**: single_choice, multiple_choice.
- **Cada opcion tiene un score** y un peso (weight) que se multiplica.
- **Rangos de puntuacion**: definen categorias (ej: "Aprobado" 70-100, "Rechazado" 0-69) y pueden apuntar a pasos diferentes.

### 4. Condition (Condicion)
- **Proposito**: Bifurcacion logica del flujo basada en reglas.
- **Config**: Multiples ramas, cada una con reglas AND/OR, y una ruta fallback.
- **Cada regla** tiene: fuente (form o evaluation previo), campo, operador, valor.
- **Operadores**: equals, not_equals, >, <, >=, <=, contains.
- **Evaluacion**: Las ramas se evaluan en orden. La primera que cumple todas sus reglas es la que se toma.

### 5. Email (Enviar Email)
- **Proposito**: Envia un correo electronico.
- **Config**: Destinatario (to), asunto (subject), cuerpo (body), cc, bcc.

### 6. HTTP (Peticion HTTP)
- **Proposito**: Realiza llamadas a APIs externas.
- **Config**: URL, metodo (GET/POST/PUT/DELETE/PATCH), headers, body.
- **Seguridad**: Proteccion SSRF en el backend.

### 7. Delay (Esperar)
- **Proposito**: Pausa la ejecucion por un tiempo determinado.
- **Config**: Duracion + unidad (seconds, minutes, hours).
- **Implementacion**: Guarda `resume_at` en la instancia. Un scheduler revisa periodicamente las instancias pausadas y las reanuda.

### 8. Database (Base de Datos)
- **Proposito**: Operaciones directas sobre la base de datos.
- **Config**: Tabla, operacion (insert/update/delete), datos, condiciones where.

### 9. Transform (Transformar Datos)
- **Proposito**: Procesa y transforma datos del contexto.
- **Config**: Input (campo origen), transformacion (logica), output (campo destino).

---

## El Editor Visual

### FlowCanvas - Componente React Flow

El canvas usa `reactflow` (v11+) y renderiza:

```typescript
<ReactFlow
  nodes={nodes}           // Nodos calculados desde steps[]
  edges={edges}           // Aristas calculadas desde nextStepId + conditionBranches
  onNodesChange={...}     // Drag, select, etc
  onEdgesChange={...}     // Agregar/quitar conexiones
  onConnect={onConnect}   // Nueva conexion manual
  onNodeDragStop={...}    // Guardar posicion al soltar
  nodeTypes={{ custom: CustomNode }}
  fitView                 // Auto-zoom para mostrar todo
>
  <Background variant="dots" gap={20} size={1} />
  <Controls />
</ReactFlow>
```

**Dimension del canvas**: 100% ancho, 500px alto, borde redondeado, fondo gris claro.

**Calculo de posicion inicial**: Si un paso no tiene posicion guardada, se calcula como:
```
x = 100 + (indice * 250)
y = 100
```
Para nuevos pasos se usa un patron alternado:
```
x = 100 + (cantidadPasos * 200)
y = 100 + (cantidadPasos % 2 === 0 ? 0 : 150)
```

---

## Configuracion de Cada Nodo

### Modal de Configuracion de Paso

Al hacer click en "Agregar Paso" o en el icono de editar de un nodo, se abre un **modal fullscreen** con:

```
┌──────────────────────────────────────────────────────────┐
│  ████████████ GRADIENTE AZUL-INDIGO ███████████████████  │
│  Nuevo Paso                                              │
│  Configura un nuevo paso en tu flujo                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Tipo de Accion              Nombre del Paso             │
│  [▼ Formulario          ]    [________________]          │
│  Captura datos del usuario                               │
│  con campos configurables                                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ⚙ Configuracion                                   │  │
│  │                                                    │  │
│  │  (contenido dinamico segun el tipo seleccionado)   │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ────────────────────────────────────────────────────── │
│  [         Crear Paso         ]  [Cancelar]              │
└──────────────────────────────────────────────────────────┘
```

- Overlay negro semitransparente con blur (`bg-black/60 backdrop-blur-sm`)
- Modal con esquinas redondeadas 2xl y sombra 2xl
- Header con gradiente azul
- Contenido scrolleable (max 90vh)
- Select de tipo que muestra TODOS los 9 tipos con descripcion
- El tipo "start" se deshabilita si ya existe uno en el flujo
- Seccion de configuracion con fondo gris claro cambia dinamicamente

### Configuracion del Nodo Start

```
┌──────────────────────────────────────────────────────────┐
│  🚀 Configuracion de Inicio                              │
│  Define como se iniciara tu flujo de trabajo             │
│                                                          │
│  ┌── FONDO AZUL CLARO ─────────────────────────────┐    │
│  │ 📄 Plantilla Seleccionada                        │    │
│  │                                                  │    │
│  │  ○ Empleados     ○ Candidatos    ○ Proveedores   │    │
│  │  ○ Clientes      ○ Productos                     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌── FONDO VERDE CLARO ────────────────────────────┐    │
│  │ 📋 Columnas de Tabla                  [+ Manual] │    │
│  │                                                  │    │
│  │  💡 Como configurar:                              │    │
│  │  • Clave: nombre del campo en los datos           │    │
│  │  • Etiqueta: titulo en la tabla                   │    │
│  │                                                  │    │
│  │  Campos de la plantilla:                          │    │
│  │  [id] [created_at] [apellido] [nombre] [email]   │    │
│  │                                                  │    │
│  │       CLAVE              ETIQUETA                │    │
│  │  [↑↓] ≡  [id           ] [ID             ] [×]  │    │
│  │  [↑↓] ≡  [created_at   ] [Creado         ] [×]  │    │
│  │  [↑↓] ≡  [apellido     ] [Apellido       ] [×]  │    │
│  │  [↑↓] ≡  [nombre       ] [Nombre         ] [×]  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌── Filtros por Defecto ──────────────────────────┐    │
│  │  Busqueda: [_________________________________]   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌── Ordenamiento por Defecto ─────────────────────┐    │
│  │  Campo: [▼ Fecha de creacion]  Dir: [▼ Desc]    │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌── Elementos por Pagina ─────────────────────────┐    │
│  │  [25]                                            │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

Caracteristicas clave:
- Las **plantillas se cargan del backend** via API (`fetchPlantillas`)
- Al seleccionar una plantilla se cargan sus **campos disponibles** automaticamente
- Los campos se pueden agregar como columnas con un click (toggle on/off)
- Las columnas se pueden **reordenar** con botones arriba/abajo
- Cada columna tiene clave (campo tecnico) y etiqueta (lo que ve el usuario)
- Se auto-guarda cuando esta embebido en el StepForm

### Configuracion del Nodo Form

```
┌──────────────────────────────────────────────────────────┐
│  Titulo del Formulario       Descripcion                 │
│  [Datos Personales      ]    [Complete los campos    ]   │
│                                                          │
│  📋 Campos del Formulario              [+ Agregar Campo] │
│                                                          │
│  ┌── Campo 1 ── FONDO GRIS ───────────────── [Eliminar]┐│
│  │  Nombre        Etiqueta       Tipo      Obligatorio  ││
│  │  [nombre    ]  [Nombre    ]  [▼ Texto]  [✓]          ││
│  │                                                      ││
│  │  Placeholder           Texto de ayuda                ││
│  │  [Ingrese su nombre]   [                         ]   ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌── Campo 2 ── FONDO GRIS ───────────────── [Eliminar]┐│
│  │  Nombre        Etiqueta       Tipo      Obligatorio  ││
│  │  [area     ]   [Area      ]  [▼ Select] [✓]          ││
│  │                                                      ││
│  │  Opciones:                            [+ Opcion]     ││
│  │  [desarrollo] [Desarrollo     ] [×]                  ││
│  │  [diseno    ] [Diseno         ] [×]                  ││
│  │  [rrhh      ] [Recursos Humanos] [×]                 ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

- Grid responsive: 4 columnas en desktop, 2 en tablet, 1 en mobile
- Los campos tipo `select` muestran un sub-editor de opciones (valor + etiqueta)
- 7 tipos de campo disponibles: text, email, number, date, select, checkbox, textarea

### Configuracion del Nodo Evaluation

```
┌──────────────────────────────────────────────────────────┐
│  Titulo de la Evaluacion     Descripcion                 │
│  [Evaluacion Tecnica    ]    [Responda las preguntas ]   │
│                                                          │
│  📋 Preguntas                        [+ Agregar Pregunta]│
│                                                          │
│  ┌── Pregunta 1 ────────────────────────── [Eliminar] ──┐│
│  │  Texto de la pregunta                    Peso         ││
│  │  [Experiencia en React?           ]      [3  ]        ││
│  │                                                      ││
│  │  Tipo: [▼ Opcion unica]                              ││
│  │                                                      ││
│  │  Opciones de respuesta:                [+ Opcion]    ││
│  │  [Ninguna               ] Puntos: [0 ] [×]          ││
│  │  [1-2 anos              ] Puntos: [3 ] [×]          ││
│  │  [3-5 anos              ] Puntos: [7 ] [×]          ││
│  │  [5+ anos               ] Puntos: [10] [×]          ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  🎯 Rangos de Puntuacion              [+ Agregar Rango]  │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  [Aprobado          ] Min: [70 ] - Max: [100] [×]   ││
│  │  [Rechazado         ] Min: [0  ] - Max: [69 ] [×]   ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

- Cada pregunta tiene peso multiplicador (1-10)
- Las opciones tienen texto visible + puntaje numerico
- Los rangos definen categorias que despues se usan en nodos Condition para bifurcar

### Configuracion del Nodo Condition

Este es el editor mas complejo. Permite crear multiples ramas de decision:

```
┌──────────────────────────────────────────────────────────┐
│  ⚠ Errores de configuracion                              │
│  • Rama 1: Falta seleccionar paso destino                │
│  • Rama 1, Regla 1: Valor vacio                          │
│                                                          │
│  Ramas de Condicion                      [Agregar ruta]  │
│                                                          │
│  ┌── Rama 1 ── BORDE ROJO (tiene errores) ──────────── ┐│
│  │  ⚠ Falta seleccionar paso destino                    ││
│  │                                                      ││
│  │  Nombre de la ruta    Logica         [↑][↓][📋][❌]  ││
│  │  [Aprobado         ]  [▼ Todas]                      ││
│  │                                                      ││
│  │  ┌── Regla 1 ─── Grid 4 columnas ─────── [Quitar]─┐ ││
│  │  │ Fuente           Campo            Op    Valor   │ ││
│  │  │ [▼ Evaluacion]  [▼ Puntaje total] [▼ >=] [70] │ ││
│  │  └────────────────────────────────────────────────┘ ││
│  │                                                      ││
│  │  [Agregar condicion]                                 ││
│  │                                                      ││
│  │  Proximo paso  ⚠                                     ││
│  │  [▼ Seleccionar paso...]                             ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌── Ruta alternativa (Fallback) ── BORDE PUNTEADO ─── ┐│
│  │  ⚠ Paso de destino si ninguna ruta cumple            ││
│  │  [▼ Finalizar flujo]                                 ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

Funcionalidades:
- **Multiples ramas** con orden de evaluacion (se evaluan de arriba a abajo)
- **Logica por rama**: AND (todas las reglas deben cumplirse) u OR (al menos una)
- **Cada regla** tiene: Fuente (select de pasos Form/Evaluation previos), Campo (auto-detectado segun el paso fuente), Operador (filtrado por tipo de campo), Valor
- **Acciones de rama**: mover arriba/abajo, clonar, eliminar (con confirmacion si tiene reglas)
- **Fallback**: ruta alternativa si ninguna rama se cumple (borde punteado)
- **Validacion en tiempo real**: borde rojo si hay errores, amarillo si hay warnings
- **Iconos de estado**: check verde si el destino esta seleccionado, triangulo rojo si falta

**Deteccion inteligente de campos:**
Cuando seleccionas un paso Form como fuente, los campos disponibles son los campos del formulario.
Cuando seleccionas un paso Evaluation como fuente, los campos disponibles son:
- `total_score` - Puntaje total
- `category` - Categoria resultante
- Por cada pregunta: `puntaje de pregunta X` y `respuesta de pregunta X`

---

## Sistema de Conexiones

### Conexiones Lineales (nextStepId)
Para la mayoria de nodos, la conexion es simple: el campo `nextStepId` del paso apunta al ID del siguiente paso. Se dibuja como una linea animada indigo con el label "N -> M".

### Conexiones de Condicion (branches + fallback)
Los nodos Condition tienen un sistema especial:
- Cada **rama** (`ConditionBranch`) tiene su propio `nextStepId`
- El **fallback** tiene `fallbackNextStepId`
- En el canvas, las ramas se dibujan en naranja y el fallback en gris punteado

### Conexiones de Evaluacion (scoring_ranges)
Los nodos Evaluation pueden tener `next_step_id` en cada rango de puntuacion, permitiendo bifurcacion automatica segun el puntaje.

### Modal de Conexion de Rama
Cuando conectas un nodo Condition a otro nodo arrastrando en el canvas, aparece un modal:

```
┌────────────────────────────────────┐
│  Seleccionar Rama                  │
│                                    │
│  ○ Rama 1: Aprobado               │
│  ○ Rama 2: Rechazado              │
│  ○ Caso contrario (fallback)      │
│                                    │
│  [Conectar]  [Cancelar]           │
└────────────────────────────────────┘
```

---

## Validacion en Tiempo Real

El componente `FlowValidator` ejecuta TODAS estas validaciones cada vez que cambia el flujo:

### Errores (bloquean el guardado)
| Validacion | Descripcion |
|---|---|
| Nombre requerido | El flujo debe tener nombre |
| Minimo 1 paso | Debe haber al menos un paso |
| Exactamente 1 Start | Ni mas ni menos |
| Condiciones con ramas | Cada condicion debe tener al menos 1 rama |
| Ramas con destino | Cada rama debe apuntar a un paso existente |
| Reglas completas | source + field + operator + value |
| Email con destinatario | Nodo email requiere campo "to" |
| HTTP con URL | Nodo HTTP requiere URL valida |
| Delay con duracion | Duracion > 0 |
| Start con plantilla | Nodo start requiere al menos 1 plantilla |
| Sin ciclos | Deteccion de ciclos via DFS |
| IDs unicos | Sin IDs de paso duplicados |

### Advertencias (se muestran pero permiten guardar)
| Validacion | Descripcion |
|---|---|
| Pasos desconectados | Pasos que no reciben ninguna conexion |
| Multiples finales | Mas de un paso sin conexion de salida |
| Ramas sin reglas | Ramas de condicion sin condiciones definidas |
| Fallback sin destino | Ruta alternativa no configurada |
| Etiquetas duplicadas | Nombres de rama repetidos |
| Operador incompatible | Operador no valido para el tipo de campo |

---

## Motor de Ejecucion

### Flujo de Ejecucion

```
Usuario selecciona legajo en StartTable
         │
         ▼
POST /instances/create_from_legajo/
  → Crea InstanciaFlujo con status='running'
  → context = { variables: { legajo_id }, forms: {}, evaluations: {} }
  → current_step = primer step (no-start)
         │
         ▼
GET /instances/{id}/current_step/
  → FlowRuntime.get_current_step_html()
  → Segun step_type:
    - form → devuelve { type, title, fields[], status }
    - evaluation → devuelve { type, title, questions[], scoring_ranges[] }
    - otros → devuelve HTML renderizado por el nodo
         │
         ▼
POST /instances/{id}/interact/
  → FlowRuntime.process_interaction(data)
  → Ejecuta logica del nodo actual
  → Guarda datos en context
  → Determina siguiente paso:
    - Normal: nextStepId
    - Condition: evalua ramas en orden
    - Evaluation: evalua scoring_ranges
    - Delay: pausa con resume_at
  → Actualiza current_step
  → Repite hasta completar
```

### Contexto de la Instancia

Cada instancia mantiene un JSON de contexto que acumula datos:

```json
{
  "variables": {
    "legajo_id": "uuid-del-legajo"
  },
  "forms": {
    "step_abc123": {
      "nombre": "Juan Perez",
      "email": "juan@example.com",
      "area": "desarrollo"
    }
  },
  "evaluations": {
    "step_def456": {
      "total_score": 85,
      "category": "Aprobado",
      "answers": {
        "q_1": { "selected": "opt3", "score": 7 },
        "q_2": { "selected": "opt2", "score": 5 }
      }
    }
  }
}
```

Las condiciones acceden a estos datos para evaluar reglas. Por ejemplo:
- `form|step_abc123|area` → "desarrollo"
- `evaluation|step_def456|total_score` → 85
- `evaluation_answer_score|step_def456|q_1` → 7

### Scheduler de Delays

El `DelayScheduler` corre como tarea periodica y:
1. Busca instancias con `status='paused'` y `resume_at <= now()`
2. Reanuda la ejecucion desde donde se pauso
3. Continua al siguiente paso

---

## Modelo de Datos

### Tabla `flows_flujo`
```sql
name         VARCHAR(255)      -- Nombre del flujo
slug         VARCHAR(50)       -- URL-friendly, unico
description  TEXT              -- Descripcion
steps_data   JSON              -- Array de pasos con toda la config
status       VARCHAR(20)       -- draft | published | archived
created_by   FK(User)
is_active    BOOLEAN
created_at   DATETIME
updated_at   DATETIME
```

### Tabla `flows_step` (formato nuevo, relacional)
```sql
id           UUID (PK)
flow         FK(Flujo)
step_type    VARCHAR(20)       -- start | form | evaluation | ...
name         VARCHAR(255)
config       JSON              -- Configuracion especifica del tipo
ui_metadata  JSON              -- Posicion, colores, etc
order        INT               -- Orden de ejecucion
```

### Tabla `flows_transition`
```sql
id           UUID (PK)
from_step    FK(Step)
to_step      FK(Step)
label        VARCHAR(255)
condition    TEXT              -- Expresion de condicion
```

### Tabla `flows_instanciaflujo`
```sql
id           UUID (PK)
flow         FK(Flujo)
legajo_id    UUID              -- Legajo asociado
current_step FK(Step)          -- Paso actual
status       VARCHAR(20)       -- pending | running | paused | completed | failed | cancelled
context      JSON              -- { variables, forms, evaluations }
resume_at    DATETIME          -- Para delays
error_message TEXT
started_at   DATETIME
completed_at DATETIME
created_by   FK(User)
```

### Tabla `flows_instancelog`
```sql
id           UUID (PK)
instance     FK(InstanciaFlujo)
step         FK(Step)
level        VARCHAR(10)       -- info | warning | error
message      TEXT
data         JSON
timestamp    DATETIME
user         FK(User)
```

**Nota sobre formato dual:** El sistema soporta dos formatos:
1. **Formato JSON** (actual/principal): Los pasos se almacenan como array JSON en `Flujo.steps_data`. Es lo que usa el frontend.
2. **Formato relacional**: Usa las tablas `Step` y `Transition`. Existe para flujos migrados o compilados desde plantillas.

---

## API Endpoints

### Flujos (CRUD)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/flows/` | Listar todos los flujos |
| POST | `/api/flows/` | Crear flujo nuevo |
| GET | `/api/flows/{id}/` | Obtener flujo por ID |
| PUT | `/api/flows/{id}/` | Actualizar flujo |
| DELETE | `/api/flows/{id}/` | Eliminar flujo |

### Ejecucion
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/flows/{id}/candidates/` | Legajos disponibles |
| POST | `/api/flows/{id}/start/` | Iniciar flujo para 1 legajo |
| POST | `/api/flows/{id}/start/bulk/` | Iniciar para multiples legajos |
| POST | `/api/flows/{id}/execute/` | Ejecutar flujo |

### Instancias
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/instances/` | Listar instancias |
| GET | `/api/instances/{id}/current_step/` | Paso actual de la instancia |
| POST | `/api/instances/{id}/interact/` | Enviar interaccion del usuario |
| POST | `/api/instances/create_from_legajo/` | Crear instancia para un legajo |

### Otros
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/flows/{id}/transitions/` | Estructura de transiciones |
| POST | `/api/flows/{id}/simulate/` | Simular evaluacion de condiciones |
| GET | `/api/logs/` | Logs de ejecucion |

---

## Ciclo de Vida Completo

### 1. Diseno
```
/flujos/nuevo → FlowEditor (isNew=true)
  → Opcionalmente cargar plantilla
  → Agregar nombre + descripcion
  → Agregar pasos (StepForm modal)
  → Conectar pasos (drag en canvas)
  → Validacion en tiempo real
  → Guardar → POST /api/flows/
```

### 2. Edicion
```
/flujos/editar/[id] → FlowEditor (flowId=id)
  → Carga flujo existente via useFlowStore
  → Misma interfaz que creacion
  → Guardar → PUT /api/flows/{id}/
```

### 3. Ejecucion
```
Boton "Ejecutar" → StartTableModal
  → Muestra tabla de legajos filtrados por plantilla
  → Usuario selecciona 1 legajo
  → POST /instances/create_from_legajo/
  → Redirect a /flujos/runtime/[instanceId]
```

### 4. Runtime (Interaccion del usuario)
```
/flujos/runtime/[instanceId] → FlowRuntime
  → GET /instances/{id}/current_step/
  → Renderiza segun tipo:
    - start → StartTable con legajos
    - form → FormRenderer con campos
    - evaluation → EvaluationRenderer con preguntas
    - otros → HTML directo
  → Usuario completa el paso
  → POST /instances/{id}/interact/
  → Backend procesa y avanza al siguiente paso
  → Loop hasta completar
```

### 5. Monitoreo
```
FlowEditor (flujo existente) muestra:
  → FlowMonitor: contadores en tiempo real (ejecutando, completados, fallidos)
  → ExecutionHistory: lista de ejecuciones recientes
  → Auto-refresh cada 2 segundos si hay instancias corriendo
```

---

## Plantillas Predefinidas

El sistema incluye plantillas listas para usar:

### Bienvenida por Email
- **Step 1**: Email - Envia email de bienvenida
- **Step 2**: HTTP - Registra evento en API externa

### Procesamiento con Validacion
- **Step 1**: HTTP - Obtiene datos de API
- **Step 2**: Condition - Valida datos
- **Step 3a**: Database - Guarda datos validos
- **Step 3b**: Email - Notifica error

Las plantillas cargan nombre, descripcion, pasos completos con config y posiciones predefinidas.

---

## Monitoreo de Ejecuciones

### FlowMonitor (panel lateral en edicion)

```
┌────────────────────────────────────┐
│  📊 Estado de Ejecuciones          │
│                                    │
│    🔄 2          ✅ 15        ❌ 1  │
│  Ejecutando   Completados  Fallidos│
├────────────────────────────────────┤
│  Ultima Ejecucion                  │
│  Legajo: abc-123-def               │
│  Estado: ✅ completed              │
│  Iniciado: 26/03/2026 14:30       │
│  Completado: 26/03/2026 14:32     │
├────────────────────────────────────┤
│  Ejecuciones Recientes             │
│  ✅ abc-123 14:32                  │
│  🔄 def-456 14:30                  │
│  ✅ ghi-789 14:25                  │
│  ❌ jkl-012 14:20                  │
└────────────────────────────────────┘
```

- Auto-refresh cada 2 segundos cuando hay instancias corriendo (`useFlowMonitor`)
- Contadores agregados en grid de 3 columnas
- Lista scrolleable de hasta 10 instancias recientes
- Click en instancia puede navegar al runtime

---

## Resumen de Componentes Frontend

| Componente | Archivo | Lineas | Funcion |
|---|---|---|---|
| FlowEditor | FlowEditor.tsx | 663 | Orquestador principal del editor |
| FlowCanvas | FlowCanvas.tsx | 343 | Canvas visual con React Flow |
| StepForm | StepForm.tsx | 310 | Modal de configuracion de paso |
| ConditionConfigEditor | ConditionConfigEditor.tsx | 679 | Editor de condiciones con ramas |
| EvaluationConfigEditor | EvaluationConfigEditor.tsx | 296 | Editor de evaluaciones |
| FormConfigEditor | FormConfigEditor.tsx | 233 | Editor de formularios |
| StartNodeProperties | StartNodeProperties.tsx | 430 | Config del nodo inicio |
| FlowRuntime | FlowRuntime.tsx | 392 | Interfaz de ejecucion |
| FlowValidator | FlowValidator.tsx | 254 | Validacion en tiempo real |
| FlowList | FlowList.tsx | 128 | Listado de flujos |
| FlowMonitor | FlowMonitor.tsx | 133 | Monitoreo de ejecuciones |
| StartTable | StartTable.tsx | ~400 | Tabla de seleccion de legajos |
| StartTableModal | StartTableModal.tsx | ~250 | Modal de inicio de flujo |
| FormRenderer | FormRenderer.tsx | ~230 | Renderizado de formularios |
| EvaluationRenderer | renderers/EvaluationRenderer.tsx | ~200 | Renderizado de evaluaciones |
| BranchConnectionModal | BranchConnectionModal.tsx | ~100 | Modal de conexion de rama |

**Total**: ~4,800+ lineas de TypeScript/React solo en componentes de flujos.

---

## Resumen de Componentes Backend

| Componente | Archivo | Lineas | Funcion |
|---|---|---|---|
| Models | models.py | 210 | 6 modelos de datos |
| Runtime | runtime.py | 935 | Motor de ejecucion |
| Nodes | nodes.py | 653 | 9 implementaciones de nodos |
| Serializers | serializers.py | 433 | Validacion y transformacion |
| ViewSets | viewsets.py | 577 | API REST endpoints |
| Executor | executor.py | 239 | Executor legacy |
| Compiler | compiler.py | 216 | Compilador de plantillas |
| Views | views.py | 140 | Vistas adicionales |
| Scheduler | scheduler.py | 44 | Procesador de delays |

**Total**: ~3,450+ lineas de Python en el modulo de flujos.
