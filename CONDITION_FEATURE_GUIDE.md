# Guía: Acción "Condición" en Flujos

## ¿Qué es una Condición?

La acción **Condición** permite crear bifurcaciones en flujos basadas en datos de pasos anteriores (formularios o evaluaciones). Evalúa reglas y dirige el flujo por diferentes rutas según los resultados.

## Cuándo Usar Condiciones

- **Formularios**: Dirigir según respuestas (edad, categoría, etc.)
- **Evaluaciones**: Bifurcar según puntaje o categoría obtenida
- **Lógica de negocio**: Aplicar diferentes procesos según criterios

## Cómo Crear una Condición

### 1. Agregar Paso de Condición
1. En el editor de flujo, click "Agregar Paso"
2. Seleccionar tipo "Condición"
3. Dar nombre descriptivo (ej: "Verificar Edad")

### 2. Configurar Ramas
Cada rama representa un camino posible:

```
Rama: "Adultos"
├── Regla 1: Formulario.edad >= 18
├── Regla 2: Formulario.categoria = "premium"  
├── Lógica: AND (ambas deben cumplirse)
└── Destino: Paso "Formulario Adultos"
```

### 3. Tipos de Reglas

#### Fuentes de Datos
- **Formulario**: Datos ingresados por usuario
- **Evaluación**: Puntajes y categorías calculadas

#### Operadores Disponibles
| Operador | Uso | Ejemplo |
|----------|-----|---------|
| `==` | Igual a | `categoria == "premium"` |
| `!=` | Diferente de | `status != "inactivo"` |
| `>` | Mayor que | `edad > 18` |
| `>=` | Mayor o igual | `puntaje >= 80` |
| `<` | Menor que | `intentos < 3` |
| `<=` | Menor o igual | `descuento <= 50` |
| `contiene` | Contiene texto | `comentario contiene "urgente"` |

#### Lógica de Rama
- **AND**: Todas las reglas deben cumplirse
- **OR**: Al menos una regla debe cumplirse

### 4. Ruta Alternativa (Fallback)
Si ninguna rama se cumple, el flujo sigue por la ruta alternativa.

## Ejemplo Práctico

### Flujo: Proceso de Inscripción

```
1. Inicio
2. Formulario Datos Personales
   ├── Campo: edad (número)
   ├── Campo: categoria (texto)
   └── Campo: experiencia (texto)

3. Condición: Clasificar Usuario
   ├── Rama "Estudiante"
   │   ├── Regla: edad < 25
   │   ├── Regla: categoria = "estudiante"
   │   ├── Lógica: AND
   │   └── Destino: Formulario Descuento Estudiante
   │
   ├── Rama "Profesional Senior"
   │   ├── Regla: edad >= 35
   │   ├── Regla: experiencia contiene "senior"
   │   ├── Lógica: OR
   │   └── Destino: Formulario Premium
   │
   └── Fallback: Formulario Estándar

4. [Diferentes formularios según clasificación]
```

## Validaciones y Errores

### Errores que Bloquean Guardado
- ❌ Rama sin paso destino
- ❌ Regla sin campo o valor
- ❌ Operador incompatible con tipo de dato
- ❌ Referencia a paso inexistente

### Advertencias (No Bloquean)
- ⚠️ Rama sin reglas configuradas
- ⚠️ Falta ruta alternativa
- ⚠️ Etiquetas de rama duplicadas

## Mejores Prácticas

### ✅ Recomendado
- Usar nombres descriptivos para ramas ("Usuarios VIP", "Menores de Edad")
- Configurar siempre ruta alternativa
- Probar todas las combinaciones posibles
- Usar lógica AND para condiciones estrictas, OR para flexibles

### ❌ Evitar
- Ramas sin reglas (siempre se ejecutarán)
- Operadores numéricos en campos de texto
- Referencias circulares entre pasos
- Demasiadas reglas complejas en una rama

## Troubleshooting

### "No se puede guardar el flujo"
- Revisar que todas las ramas tengan destino
- Verificar que todas las reglas estén completas
- Comprobar que no hay referencias a pasos eliminados

### "La condición no funciona como esperado"
- Verificar que los nombres de campos coincidan exactamente
- Revisar la lógica AND/OR de la rama
- Comprobar que los valores de comparación sean correctos

### "El flujo se queda en la condición"
- Asegurar que hay ruta alternativa configurada
- Verificar que al menos una rama puede cumplirse
- Revisar logs de ejecución para ver qué reglas fallan

## Limitaciones Actuales

- Máximo recomendado: 10 ramas por condición
- Solo soporta comparaciones simples (no expresiones complejas)
- No soporta operaciones matemáticas entre campos
- Los valores de comparación deben ser literales (no variables)

## Soporte Técnico

Para problemas técnicos:
1. Revisar logs de ejecución en el panel de administración
2. Verificar configuración en modo JSON si es necesario
3. Contactar al equipo de desarrollo con detalles del flujo problemático