from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import connection
from django.http import JsonResponse


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def count_records(request):
    """
    Endpoint para contar registros de una tabla con filtros opcionales.
    
    Query params:
    - table: nombre de la tabla (requerido)
    - filter_{column}: filtros opcionales por columna
    
    Ejemplo: /api/calculated-fields/count?table=legajos&filter_estado=activo
    """
    table = request.GET.get('table')
    
    if not table:
        return JsonResponse({'error': 'Table parameter is required'}, status=400)
    
    # Validar nombre de tabla (solo permitir tablas específicas por seguridad)
    allowed_tables = ['legajos', 'personas', 'documentos', 'relaciones']
    if table not in allowed_tables:
        return JsonResponse({'error': f'Table {table} not allowed'}, status=403)
    
    # Construir query con filtros
    filters = []
    params = []
    
    for key, value in request.GET.items():
        if key.startswith('filter_'):
            column = key.replace('filter_', '')
            # Validar nombre de columna (solo alfanuméricos y guiones bajos)
            if not column.replace('_', '').isalnum():
                continue
            filters.append(f"{column} = %s")
            params.append(value)
    
    # Construir query SQL
    where_clause = f" WHERE {' AND '.join(filters)}" if filters else ""
    query = f"SELECT COUNT(*) as count FROM {table}{where_clause}"
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            result = cursor.fetchone()
            count = result[0] if result else 0
        
        return JsonResponse({'count': count, 'table': table})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
