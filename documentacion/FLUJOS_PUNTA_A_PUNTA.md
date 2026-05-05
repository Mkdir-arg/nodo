# Flujos de NODO - Documento Maestro End-to-End

## 1. Objetivo de este documento

Este documento describe el modulo de flujos de NODO de punta a punta, con foco en la implementacion real que existe hoy en el repositorio.

La idea es que sirva para cuatro perfiles:

- producto: entender que problema resuelve y hasta donde llega
- funcional: entender como se diseña y se opera un flujo
- desarrollador frontend: entender como se arma el editor, el runtime y la UI
- desarrollador backend: entender el modelo, la persistencia, la ejecucion y los puntos de extension

Este documento no describe una arquitectura idealizada. Describe:

- el recorrido activo que usa hoy la aplicacion
- las capas legacy o desalineadas que todavia conviven en el codigo
- los contratos de datos reales entre frontend, backend y base de datos

---

## 2. Que es el modulo de flujos

El modulo `flows` es un motor de workflows visuales para construir procesos guiados a partir de nodos conectados.

En terminos simples, permite:

- diseñar un proceso como un grafo
- guardar ese proceso como definicion persistente
- ejecutarlo sobre un legajo concreto
- mantener estado entre pasos
- renderizar pantallas dinamicas segun el nodo actual
- tomar decisiones con condiciones y evaluaciones
- registrar logs e historial de ejecucion

### 2.1 Problemas que resuelve

- capturar datos en formularios secuenciales o ramificados
- evaluar respuestas y calcular scoring
- decidir caminos de negocio en funcion de datos previos
- ejecutar acciones tecnicas como email, HTTP, delay, transformaciones o pasos de base de datos
- correr el mismo proceso sobre distintos legajos sin duplicar logica

### 2.2 Lo que el modulo no es

- no es un BPMN completo
- no es un motor de reglas desacoplado del dominio
- no compila a Python ni a JavaScript; compila a una estructura de pasos y transiciones persistida en base de datos
- no es totalmente homogéneo: hoy conviven varias capas de ejecucion, algunas activas y otras legacy

---

## 3. Modelo conceptual

Los conceptos base son estos:

### 3.1 Flujo

Es la definicion del programa. Tiene nombre, descripcion, estado, autor y una representacion JSON de sus pasos.

### 3.2 Step

Es un nodo ejecutable del flujo. Cada step tiene:

- un tipo (`start`, `form`, `evaluation`, `email`, `http`, `delay`, `condition`, `database`, `transform`)
- una configuracion (`config`)
- una posicion de UI (`ui_metadata.position`)
- un orden persistido

### 3.3 Transition

Es una arista entre dos steps. En nodos normales representa el siguiente paso. En nodos `condition`, representa una rama o un fallback.

### 3.4 InstanciaFlujo

Es una corrida concreta de un flujo sobre un legajo. Tiene:

- el flujo origen
- el legajo destino
- el step actual
- el `context` acumulado
- estado de ejecucion
- timestamps
- errores y logs

### 3.5 Context

Es la memoria viva de la instancia. Ahi se guardan:

- variables generales
- formularios respondidos
- resultados de evaluaciones

### 3.6 Legajo

Es el objeto de negocio sobre el cual corre el flujo. El modulo de flujos no define el legajo; lo consume desde el modulo `legajos`.

### 3.7 Plantilla

Es una estructura del modulo `plantillas` que puede usarse de dos formas:

- para filtrar y mostrar legajos elegibles en el nodo `start`
- para compilar una plantilla a un flujo a traves de `TemplateCompiler`

---

## 4. Vista general de arquitectura

## 4.1 Stack

- frontend: Next.js + React + TypeScript + React Flow + Zustand + React Query
- backend: Django + Django REST Framework
- base de datos: MySQL
- cache: Django cache + Redis en el entorno general del proyecto

## 4.2 Idea arquitectonica

El modulo tiene tres capas principales:

1. diseño
2. persistencia y normalizacion
3. ejecucion y render runtime

### 4.2.1 Diseño

El usuario arma el flujo en frontend como un grafo visual.

### 4.2.2 Persistencia

El backend recibe `steps_data`, valida la estructura, genera filas `Step` y `Transition`, y ademas reescribe `steps_data` en formato normalizado.

### 4.2.3 Ejecucion

Se crea una `InstanciaFlujo`, se determina el step actual, se renderiza la pantalla correspondiente, se procesa la interaccion del usuario, se actualiza el contexto y se avanza.

---

## 5. Mapa de archivos importante

### 5.1 Backend

```text
backend/flows/
  models.py
  serializers.py
  viewsets.py
  views.py
  runtime.py
  nodes.py
  compiler.py
  scheduler.py
  executor.py
  flow_engine.py
  flow_runner.py
  simple_views.py
  direct_views.py
  urls.py
  tests/
```

### 5.2 Frontend

```text
frontend/src/app/flujos/
frontend/src/components/flows/
frontend/src/lib/api/flows.ts
frontend/src/lib/store/useFlowStore.ts
frontend/src/lib/hooks/useFlowExecution.ts
frontend/src/lib/hooks/useFlowMonitor.ts
frontend/src/lib/flows/types.ts
```

---

## 6. El recorrido end-to-end real

Esta es la secuencia importante del modulo tal como funciona hoy.

### 6.1 Paso 1: el usuario diseña el flujo

La pantalla principal es `frontend/src/components/flows/FlowEditor.tsx`.

Ese componente:

- carga el flujo actual o prepara uno nuevo
- deja editar nombre y descripcion
- permite agregar nodos via `StepForm`
- renderiza el canvas con `FlowCanvas`
- valida en vivo con `FlowValidator`
- guarda el flujo usando `useFlowStore`

El `FlowEditor` trabaja sobre una estructura frontend llamada `FlowStep`, definida en `frontend/src/lib/flows/types.ts`.

La forma base de un step en frontend es:

```ts
{
  id: string,
  type: ActionType,
  name: string,
  config: ActionConfig,
  position?: { x: number; y: number },
  nextStepId?: string
}
```

Para condiciones, el `nextStepId` simple se reemplaza por ramas en `config.branches`.

### 6.2 Paso 2: el canvas visual arma el grafo

`frontend/src/components/flows/FlowCanvas.tsx` transforma `steps` en nodos y edges de React Flow.

Sus responsabilidades son:

- construir nodos visuales con iconos y metadata
- construir edges desde `nextStepId`
- construir edges desde ramas de condicion
- permitir drag and drop y persistir posiciones
- permitir conexiones nuevas entre nodos

El canvas no ejecuta logica de negocio. Solo edita la definicion del grafo.

### 6.3 Paso 3: configuracion de nodos

`frontend/src/components/flows/StepForm.tsx` es el formulario maestro de configuracion de cada step.

Segun el tipo de nodo, delega en:

- `StartNodeProperties`
- `FormConfigEditor`
- `EvaluationConfigEditor`
- `ConditionConfigEditor`

Cada editor produce el `config` que despues se guarda en backend.

### 6.4 Paso 4: guardado del flujo

El store `frontend/src/lib/store/useFlowStore.ts` convierte `steps` a `steps_data` y llama al API client `frontend/src/lib/api/flows.ts`.

La peticion de guardado envia algo conceptualmente asi:

```json
{
  "name": "Mi flujo",
  "description": "Descripcion",
  "steps_data": [
    {
      "id": "uuid-o-id-local",
      "name": "Inicio",
      "type": "start",
      "config": { "acceptedPlantillas": ["..."], "tableColumns": [] },
      "position": { "x": 100, "y": 100 },
      "nextStepId": "otro-step"
    }
  ]
}
```

### 6.5 Paso 5: validacion backend y compilacion estructural

El backend recibe ese payload en `FlujoViewSet`, serializa con `FlujoSerializer` y pasa por dos etapas importantes:

#### 6.5.1 Validacion estructural

`_validate_flow_structure()` valida, entre otras cosas:

- IDs duplicados
- referencias a pasos inexistentes
- ramas de condicion invalidas
- operadores invalidos
- ciclos en el grafo

#### 6.5.2 Normalizacion y materializacion

`_sync_flow_structure()` hace la transformacion clave:

- borra los `flow_steps` existentes
- crea un `Step` por cada nodo del JSON
- guarda `position` en `ui_metadata`
- crea `Transition` para conexiones normales
- crea `Transition` especiales para ramas y fallback de condiciones
- reescribe el JSON normalizado con IDs definitivos

Este es el momento en el que el editor visual se convierte efectivamente en un programa persistido.

### 6.6 Paso 6: creacion de una instancia

Para correr un flujo se necesita una `InstanciaFlujo`.

La funcion central es `create_instance_from_legajo()` en `backend/flows/runtime.py`.

Su comportamiento actual es:

- si existen `Step` persistidos, busca el flujo ordenado por `order`
- arranca en el segundo paso (`steps[1]`), no en el `start`
- el `start` se considera una capa de seleccion previa, no un paso interactivo de la instancia real
- crea la instancia con `status='running'`
- crea un log inicial

Si no existen `Step` persistidos, intenta degradar a `steps_data` legacy.

### 6.7 Paso 7: carga del paso actual

El frontend runtime vive en `frontend/src/components/flows/FlowRuntime.tsx`.

Ese componente llama al endpoint `instances/{id}/current_step/`.

El backend responde desde `InstanciaFlujoViewSet.current_step()` y delega a `FlowRuntime.get_current_step_html()`.

Ese metodo puede devolver dos tipos de respuesta:

- JSON estructurado para `form` y `evaluation`
- HTML ya renderizado para otros nodos

Ademas adjunta:

- transiciones disponibles
- metadata del flujo
- paso actual
- estado de la instancia

### 6.8 Paso 8: render de pantalla

En frontend, el runtime decide que componente mostrar segun `stepData.type`:

- `start` -> `StartTable`
- `form` -> `FormRenderer`
- `evaluation` -> `EvaluationRenderer`
- `html` -> `dangerouslySetInnerHTML`

En otras palabras, las pantallas no estan hardcodeadas por pagina. Se construyen dinamicamente segun el nodo actual.

### 6.9 Paso 9: interaccion del usuario

Cuando el usuario envia un formulario, responde una evaluacion o confirma un nodo, frontend llama a `instances/{id}/interact/`.

El backend ejecuta `FlowRuntime.process_interaction()`.

Ese metodo:

- identifica el tipo de step actual
- ejecuta la logica correspondiente
- actualiza `context`
- calcula el siguiente paso
- persiste `current_step`, `status` y logs

### 6.10 Paso 10: avance de estado

La instancia puede quedar en uno de estos estados:

- `pending`
- `running`
- `paused`
- `completed`
- `failed`
- `cancelled`

`delay` es el caso especial: pausa la instancia y deja `resume_at` para que luego el scheduler la reanude.

---

## 7. Frontend en detalle

## 7.1 Paginas

Las paginas principales son:

- `frontend/src/app/flujos/page.tsx`: listado de flujos
- `frontend/src/app/flujos/nuevo/page.tsx`: alta
- `frontend/src/app/flujos/editar/[id]/page.tsx`: edicion
- `frontend/src/app/flujos/runtime/[instanceId]/page.tsx`: runtime

## 7.2 Listado y acciones

`FlowList.tsx` muestra tarjetas de flujos con acciones como:

- ejecutar
- editar
- eliminar
- monitorear historico

## 7.3 Store y cliente API

`useFlowStore.ts` es la capa de estado local para:

- cargar flujos
- crear y actualizar flujos
- seleccionar el flujo actual
- agregar, actualizar y borrar pasos

`flows.ts` define las llamadas REST.

## 7.4 Editor visual

`FlowEditor.tsx` es el orquestador del diseño.

Responsabilidades principales:

- mantener `flowData` basico
- cargar plantillas de flujo predefinidas
- abrir el modal de creacion/edicion de steps
- validar antes de guardar
- reconectar pasos al borrar nodos
- mostrar monitoreo e historial para flujos existentes

## 7.5 Validacion en vivo

`FlowValidator.tsx` corre validaciones de cliente antes del guardado. Valida, entre otras cosas:

- nombre obligatorio
- existencia de un unico nodo `start`
- configuracion minima de `email`, `http`, `delay` y `condition`
- ciclos
- IDs duplicados
- nodos huerfanos
- multiples puntos finales

Importante: esta validacion no reemplaza la del backend. Solo mejora UX.

## 7.6 Configuracion de `start`

`StartNodeProperties.tsx` define:

- plantillas aceptadas
- columnas que se ven en la tabla de seleccion
- filtro de busqueda inicial
- orden por defecto
- tamaño de pagina

Esto no ejecuta el flujo; configura la puerta de entrada del flujo.

## 7.7 Configuracion de `form`

`FormConfigEditor.tsx` permite definir:

- `title`
- `description`
- lista de campos

Cada campo puede tener:

- `name`
- `label`
- `type`
- `required`
- `placeholder`
- `help_text`
- `options` en campos `select`

## 7.8 Configuracion de `evaluation`

`EvaluationConfigEditor.tsx` permite definir:

- titulo y descripcion
- preguntas
- opciones por pregunta
- puntaje por opcion
- peso de cada pregunta
- rangos de scoring

Los rangos de scoring son la base de las bifurcaciones automaticas posteriores.

## 7.9 Configuracion de `condition`

`ConditionConfigEditor.tsx` define ramas con:

- `id`
- `label`
- `logic` (`AND` u `OR`)
- `rules`
- `nextStepId`
- `fallbackNextStepId`

Cada regla puede mirar datos previos de formularios o evaluaciones.

## 7.10 Runtime frontend

`FlowRuntime.tsx` tiene dos modos conceptuales:

- modo instancia real: trabaja con una `InstanciaFlujo` ya creada
- modo `flow-{id}`: muestra una entrada sintetica para seleccionar legajo y luego crear la instancia real

Este componente:

- carga el paso actual
- carga legajos para el selector de inicio
- renderiza el componente correcto segun el tipo de nodo
- envia las interacciones al backend
- redirige a la instancia creada cuando corresponde

## 7.11 Monitoreo frontend

`useFlowMonitor.ts` consulta instancias por flujo y hace polling cada 2 segundos si detecta instancias `pending` o `running`.

`FlowMonitor.tsx` muestra:

- cantidad ejecutando
- cantidad completadas
- cantidad fallidas
- ultima ejecucion
- lista corta de instancias recientes

`ExecutionHistory.tsx` muestra el historico de `EjecucionFlujo`, que pertenece a una capa de ejecucion distinta a la de `InstanciaFlujo`.

---

## 8. Backend en detalle

## 8.1 Modelos

### 8.1.1 Flujo

Campos importantes:

- `name`
- `slug`
- `description`
- `steps_data`
- `status`
- `created_by`
- `is_active`

`steps_data` es la representacion JSON del grafo. Sigue existiendo aun cuando el flujo ya fue materializado en `Step` y `Transition`.

### 8.1.2 Step

Representa un nodo persistido con:

- `step_type`
- `name`
- `config`
- `ui_metadata`
- `order`

### 8.1.3 Transition

Representa una arista. En condiciones usa `condition` para guardar:

- el `branch_id`
- o el marcador especial `__fallback__`

### 8.1.4 InstanciaFlujo

Representa la ejecucion activa o historica por legajo.

El campo mas importante es `context`, que es el estado acumulado de la ejecucion.

### 8.1.5 InstanceLog

Registra:

- nivel (`info`, `warning`, `error`)
- mensaje
- step asociado
- data adicional
- timestamp

## 8.2 Serializers

`FlujoSerializer` hace el trabajo mas importante de entrada/salida.

Funciones clave:

- `get_steps()`: reconstruye el flujo para el frontend desde `Step` y `Transition`
- `_validate_flow_structure()`: valida integridad
- `_sync_flow_structure()`: materializa y normaliza
- `create()` y `update()`: orquestan la persistencia real

La regla general es:

- frontend manda `steps_data`
- backend responde `steps`

## 8.3 Viewsets y endpoints

### 8.3.1 FlujoViewSet

Responsable de CRUD y algunas acciones auxiliares.

Endpoints relevantes:

- `GET /flows/`
- `POST /flows/`
- `GET /flows/{id}/`
- `PUT /flows/{id}/`
- `DELETE /flows/{id}/`
- `GET /flows/{id}/candidates/`
- `POST /flows/compile_from_template/`
- `GET /flows/{id}/steps/`
- `GET /flows/{id}/instances/`

Existen tambien:

- `POST /flows/{id}/start/`
- `POST /flows/{id}/start/bulk/`
- `POST /flows/{id}/execute/`
- `GET /flows/{id}/executions/`

Pero esas rutas no forman hoy el camino mas consistente del runtime principal y deben leerse con cuidado.

### 8.3.2 InstanciaFlujoViewSet

Es la capa principal del runtime real.

Endpoints clave:

- `POST /instances/create_from_legajo/`
- `GET /instances/{id}/current_step/`
- `POST /instances/{id}/interact/`
- `GET /instances/{id}/logs/`
- `GET /instances/{id}/context/`

## 8.4 Runtime

`backend/flows/runtime.py` es el corazon de la ejecucion interactiva.

Responsabilidades:

- determinar el step actual
- serializar el contenido necesario para UI
- procesar formularios y evaluaciones
- actualizar contexto
- evaluar condiciones
- seleccionar el proximo paso
- pausar y reanudar delays
- registrar logs

### 8.4.1 Doble compatibilidad

El runtime soporta dos formatos:

- formato nuevo: `Step` + `Transition`
- formato viejo: `steps_data` con `current_step_index`

Cuando puede, privilegia el formato nuevo.

## 8.5 Nodos

`nodes.py` implementa las clases por tipo de step.

La interfaz comun es:

- `render_html()`
- `execute()`
- `validate_input()` opcional

El runtime decide cuando invocarlas.

## 8.6 Compiler

`TemplateCompiler` toma una `Plantilla` y genera un `Flujo`.

Hace esto:

- crea o reutiliza el flujo
- limpia steps existentes
- crea un `start`
- transforma `sections` en nodos `form` o `evaluation`
- transforma `actions` en nodos de accion
- encadena transiciones lineales

Esto sirve para bootstrapear flujos desde plantillas del sistema.

## 8.7 Scheduler

`scheduler.py` procesa instancias `paused` cuyo `resume_at` ya vencio.

La reanudacion se dispara mediante el comando:

```bash
python manage.py process_delays
```

---

## 9. Como funciona cada tipo de nodo

## 9.1 StartNode

Rol:

- presentar la entrada del flujo
- permitir seleccionar legajo
- configurar filtros y columnas del selector

En el runtime real de instancia, normalmente no se ejecuta como primer `current_step`. La seleccion del legajo ocurre antes de crear la instancia o en el modo sintetico `flow-{id}` del frontend.

## 9.2 FormNode

Rol:

- mostrar un formulario configurable
- validar requeridos y emails
- guardar respuestas en el contexto

Guardado actual en runtime nuevo:

```json
context.forms.step_<step_uuid> = {
  "data": { ... },
  "timestamp": "...",
  "user_id": 123
}
```

Luego avanza por la primera transicion saliente.

## 9.3 EvaluationNode

Rol:

- mostrar preguntas
- sumar puntajes
- asignar categoria
- opcionalmente devolver `next_step_id`

Guarda puntaje, categoria y respuestas.

## 9.4 ConditionNode

Rol:

- inspeccionar el `context`
- evaluar reglas
- elegir la rama compatible
- usar fallback si ninguna coincide

La evaluacion no vive en `ConditionNode.execute()`. Vive principalmente en `FlowRuntime._select_condition_branch()`.

## 9.5 EmailNode

Rol:

- enviar email mediante `send_mail`
- guardar metadata del ultimo email enviado en `context.variables`

## 9.6 HttpNode

Rol:

- ejecutar una llamada HTTP externa
- guardar status y body parcial de respuesta en contexto

## 9.7 DelayNode

Rol:

- pausar la instancia hasta una fecha futura

Produce `pause_until`, y luego el runtime usa `pause_for_delay()`.

## 9.8 DatabaseNode

Rol:

- representar una operacion de base de datos

Hoy esta implementado de forma minima y no contiene una logica de persistencia real compleja.

## 9.9 TransformNode

Rol:

- leer una variable del contexto
- transformarla
- escribir un resultado en otra variable

---

## 10. Como se renderizan las pantallas

Este punto es central para entender el modulo.

## 10.1 Render server-driven y client-driven al mismo tiempo

El runtime es hibrido.

### 10.1.1 Render estructurado

Para `form` y `evaluation`, backend devuelve JSON con estructura de campos o preguntas. Luego frontend pinta componentes React.

Ventajas:

- UI mas rica
- validaciones y presentacion mejores
- mas control visual

### 10.1.2 Render HTML

Para otros nodos, backend puede devolver HTML armado desde `render_html()` y frontend lo inserta con `dangerouslySetInnerHTML`.

Antes de eso, backend sanitiza el HTML para remover:

- scripts
- atributos `on*`
- `javascript:`

## 10.2 Componentes visuales del runtime

### StartTable

Renderiza:

- busqueda
- filtros
- tabla seleccionable
- accion para continuar con un legajo

### FormRenderer

Renderiza un formulario con campos dinamicos. Convierte el submit a un objeto plano que luego viaja al backend.

### EvaluationRenderer

Renderiza preguntas, calcula progreso, puntaje en vivo y luego envia respuestas al backend.

---

## 11. Estructura de datos importante

## 11.1 Shape de un flujo en frontend

```json
{
  "id": "flow-id",
  "name": "Onboarding",
  "description": "Flujo de ejemplo",
  "steps": [
    {
      "id": "start-1",
      "name": "Inicio",
      "type": "start",
      "config": {
        "acceptedPlantillas": ["plantilla-id"],
        "tableColumns": [
          { "key": "id", "label": "ID" },
          { "key": "created_at", "label": "Creado" }
        ],
        "defaultFilters": { "search": "" },
        "defaultSort": { "key": "created_at", "dir": "desc" },
        "pageSize": 25
      },
      "position": { "x": 100, "y": 100 },
      "nextStepId": "form-1"
    }
  ]
}
```

## 11.2 Shape de una condicion

```json
{
  "branches": [
    {
      "id": "adult_branch",
      "label": "Adulto",
      "logic": "AND",
      "rules": [
        {
          "id": "rule-1",
          "source": "form|<step_id>",
          "field": "form|<step_id>|edad",
          "operator": ">=",
          "value": "18"
        }
      ],
      "nextStepId": "step-destino"
    }
  ],
  "fallbackNextStepId": "step-fallback"
}
```

## 11.3 Shape del contexto

Estado inicial nominal:

```json
{
  "variables": {},
  "forms": {},
  "evaluations": {}
}
```

Ejemplo luego de un formulario:

```json
{
  "variables": {},
  "forms": {
    "step_8e2a...": {
      "data": {
        "nombre": "Ana",
        "email": "ana@test.com"
      },
      "timestamp": "2026-05-05T10:30:00Z",
      "user_id": 1
    }
  },
  "evaluations": {}
}
```

Ejemplo luego de una evaluacion:

```json
{
  "evaluations": {
    "Entrevista Tecnica": {
      "total_score": 18,
      "category": "Aprobado",
      "answers": {
        "q1": {
          "selected": "opt1",
          "score": 10
        }
      },
      "timestamp": "2026-05-05T10:40:00Z"
    }
  }
}
```

---

## 12. Como el flujo se usa como programa

Hay que pensar un flujo como una maquina de estados persistida.

## 12.1 La definicion del programa

La definicion esta en:

- `Flujo.steps_data`
- `Step`
- `Transition`

## 12.2 El estado del programa en ejecucion

El estado esta en:

- `InstanciaFlujo.current_step`
- `InstanciaFlujo.context`
- `InstanciaFlujo.status`

## 12.3 El interprete del programa

El interprete es `FlowRuntime`.

Sus entradas son:

- la definicion del flujo
- el estado actual de la instancia
- la interaccion del usuario

Su salida es:

- una pantalla a mostrar
- una actualizacion de contexto
- una decision de avance
- un cambio de estado

---

## 13. Operacion y gestion del modulo

## 13.1 Como iniciar un flujo

Hoy existen varias rutas:

### Ruta A: instancia desde legajo

`POST /instances/create_from_legajo/`

Es la ruta mas alineada con el runtime actual.

### Ruta B: modo `flow-{id}` en frontend runtime

El frontend abre un runtime sintetico, pide el legajo y luego crea la instancia real.

### Ruta C: `start` y `start/bulk`

Existen endpoints en `FlujoViewSet`, pero no son hoy el camino mas consistente con el modelo real de `InstanciaFlujo`.

### Ruta D: `execute`

Existe un camino alternativo con `EjecucionFlujo` + `FlowExecutor`, mas cercano a ejecucion batch o legacy.

## 13.2 Como se monitorea

- por `InstanciaFlujo` para ejecucion runtime interactiva
- por `InstanceLog` para logs detallados
- por `EjecucionFlujo` para una capa separada de historico de ejecuciones

## 13.3 Como se reanudan delays

Se usa el comando:

```bash
python manage.py process_delays
```

Eso recorre instancias pausadas y llama a `resume_from_delay()`.

## 13.4 Cache

El endpoint `current_step` cachea por 30 segundos la respuesta del paso actual.

Luego de una interaccion, ese cache se invalida.

## 13.5 Logs

Cada avance importante del runtime registra un `InstanceLog`.

Se usa para:

- auditoria
- diagnostico
- trazabilidad

---

## 14. Seguridad y validaciones

## 14.1 Frontend

- validacion en vivo del grafo
- sanitizacion basica en StepForm para HTML, URL y email

## 14.2 Backend

- validacion estructural del grafo
- sanitizacion de HTML y mensajes de log
- validacion de email en `FormNode` y `EmailNode`
- restricciones basicas en `HttpNode` y `FlowExecutor` para evitar algunas URLs inseguras

## 14.3 Permisos

El estado actual del modulo deja varias `permission_classes = []`.

Eso significa que, desde el punto de vista de hardening, el modulo aun necesita una politica mas consistente de autenticacion y autorizacion.

---

## 15. Arquitectura activa vs capas legacy

Este punto es imprescindible para entender el codigo sin confundirse.

## 15.1 Camino activo recomendado

El camino mas coherente hoy es:

1. `FlowEditor` diseña `steps`
2. `useFlowStore` envia `steps_data`
3. `FlujoSerializer._sync_flow_structure()` crea `Step` + `Transition`
4. `create_instance_from_legajo()` crea `InstanciaFlujo`
5. `InstanciaFlujoViewSet.current_step()` consulta `FlowRuntime`
6. `InstanciaFlujoViewSet.interact()` procesa el avance

## 15.2 Capas legacy o secundarias

Tambien existen estas piezas:

- fallback runtime basado en `steps_data` y `current_step_index`
- `FlowExecutor` basado en `EjecucionFlujo`
- `flow_engine.py`
- `flow_runner.py`
- `simple_views.py`
- `direct_views.py`

No todas estas capas estan rotas, pero no todas forman parte del camino principal que usa la UI de runtime interactiva.

---

## 16. Desalineaciones tecnicas actuales

Esta seccion no invalida el modulo. Sirve para leerlo correctamente.

## 16.1 Multiples caminos de lanzamiento

Hoy conviven varios entrypoints para iniciar ejecuciones. Eso agrega complejidad y hace que no todos esten alineados con el mismo modelo.

## 16.2 `start/start-bulk` no son la referencia canónica

El codigo de esos endpoints referencia campos y formas de instancia que no representan el camino principal del runtime interactivo actual.

## 16.3 `ExecuteFlowButton` y `CreateInstanceView` no hablan exactamente el mismo contrato

El boton de ejecucion usa una carga distinta a la esperada por `CreateInstanceView`, por lo que esa ruta debe considerarse con cautela.

## 16.4 Evaluaciones y condiciones tienen una desalineacion de clave en contexto

En el runtime nuevo:

- `FormNode` guarda por `step_<step_id>`
- `EvaluationNode` guarda por `step.name`

Pero el resolvedor compuesto de condiciones para evaluaciones busca normalmente por `step_<step_id>`. Eso implica que las condiciones sobre resultados de evaluacion necesitan una revision fina para quedar completamente coherentes.

## 16.5 Monitoreo mezclado

El frontend muestra tanto `InstanciaFlujo` como `EjecucionFlujo`, que pertenecen a caminos de ejecucion distintos.

---

## 17. Estrategia para mantener y extender el modulo

Si hay que trabajar este modulo, el orden recomendado es:

1. preservar `FlujoSerializer` como punto central de persistencia
2. preservar `FlowRuntime` como punto central de interpretacion
3. unificar el camino de lanzamiento en torno a `InstanciaFlujo`
4. consolidar el contrato del `context`
5. recien despues, limpiar las capas legacy

## 17.1 Si agregas un nuevo tipo de nodo

Hay que tocar, como minimo:

- `backend/flows/models.py` para registrar el tipo
- `backend/flows/nodes.py` para implementar la clase
- `backend/flows/runtime.py` para registrarla en `NODE_CLASSES`
- `frontend/src/lib/flows/types.ts` para exponer el tipo en UI
- `frontend/src/components/flows/StepForm.tsx` para su configuracion
- `frontend/src/components/flows/FlowCanvas.tsx` para iconografia/visualizacion
- validaciones de frontend y backend si aplica

## 17.2 Si queres depurar una ejecucion

El camino correcto de lectura es:

1. revisar `InstanciaFlujo.current_step`
2. revisar `InstanciaFlujo.context`
3. revisar `InstanceLog`
4. revisar `Transition` salientes del `current_step`
5. revisar `config` del step actual

---

## 18. Recorrido recomendado para leer el codigo

Si alguien nuevo entra al repo, el orden recomendado es:

1. `frontend/src/lib/flows/types.ts`
2. `frontend/src/components/flows/FlowEditor.tsx`
3. `frontend/src/components/flows/FlowCanvas.tsx`
4. `frontend/src/components/flows/StepForm.tsx`
5. `backend/flows/models.py`
6. `backend/flows/serializers.py`
7. `backend/flows/runtime.py`
8. `backend/flows/nodes.py`
9. `backend/flows/viewsets.py`
10. `backend/flows/compiler.py`
11. `backend/flows/scheduler.py`

---

## 19. Resumen ejecutivo final

El modulo de flujos de NODO funciona como un interprete de grafos de negocio persistidos.

Su recorrido real es:

- frontend diseña un grafo
- backend lo normaliza y lo baja a `Step` + `Transition`
- se crea una `InstanciaFlujo` por legajo
- `FlowRuntime` interpreta el nodo actual
- frontend renderiza la pantalla adecuada
- cada interaccion actualiza el `context` y mueve el `current_step`

La arquitectura principal es consistente, pero conviven varias capas historicas que hacen necesario distinguir entre:

- el camino principal interactivo basado en `InstanciaFlujo`
- caminos legacy o parciales basados en `steps_data`, `EjecucionFlujo` y runners alternativos

La referencia canónica para entender el modulo debe ser siempre este documento junto con:

- `backend/flows/serializers.py`
- `backend/flows/runtime.py`
- `frontend/src/components/flows/FlowEditor.tsx`
- `frontend/src/components/flows/FlowRuntime.tsx`
