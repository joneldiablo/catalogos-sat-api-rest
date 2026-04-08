## Sqlite auto

Generate API REST from sqlite database

# Catálogos incluidos

- Catálogos de CFDI 4.0 (**cfdi-40-**).
- Catálogos de CFDI 3.3 (**cfdi-**).
- Catálogos de CFDI De Retenciones e Información de Pagos 2.0 (**ret-20-**).
- Catálogos de complemento de Pagos 1.1 (**pagos-**).
- Catálogos de complemento de Nóminas 1.1 (**nomina-**).
- Catálogos de complemento de Comercio Exterior 1.1 (**cce-**).
- Catálogos de complemento de Comercio Exterior 2.0 (**cce-20-**).
- Catálogos de complemento de Carta Porte 2.0 (**ccp-20-**).
- Catálogos de complemento de Carta Porte 3.0 (**ccp-30-**).

# Uso

```bash
npm start
```

# API REST

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tables` | Lista todas las tablas disponibles |
| GET | `/api/meta` | Lista tablas con sus columnas y tipos |
| GET | `/api/:tableName` | Consulta datos de una tabla |

## Parámetros de consulta

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `search` | Búsqueda en todas las columnas | `?search=MX` |
| `limit` | Registros por página (default: 100) | `?limit=50` |
| `page` | Número de página | `?page=2` |
| `orderBy.columna` | Ordenar por columna | `?orderBy.id=asc` |
| `select` | Columnas a retornar | `?select=id,nombre` |

## Ejemplos

```bash
# Listar países
curl "http://localhost:3000/api/cfdi-40-paises"

# Filtrar por búsqueda
curl "http://localhost:3000/api/cfdi-40-paises?search=México"

# Paginación
curl "http://localhost:3000/api/cfdi-40-paises?page=2&limit=10"

# Ordenamiento
curl "http://localhost:3000/api/cfdi-40-paises?orderBy.c_Nombre=asc"

# Seleccionar columnas específicas
curl "http://localhost:3000/api/cfdi-40-paises?select=c_Nombre,c_Descripcion"
```

## Respuesta

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 100,
    "totalRecords": 62
  }
}
```

# Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto del servidor |
| `API_PATH_PREFIX` | `/api` | Prefijo para rutas API |
| `ENABLE_FRONTEND` | `false` | Habilitar API Explorer en `/` |

```bash
# Ejemplo con todas las variables
PORT=8080 API_PATH_PREFIX=/v1 ENABLE_FRONTEND=1 npm start
```

# API Explorer

Cuando `ENABLE_FRONTEND=1`, se sirve un frontend interactivo en la raíz (`/`) que permite:

- Explorar todas las tablas disponibles
- Filtrar datos con búsqueda, paginación y ordenamiento
- Seleccionar columnas a mostrar
- Copiar datos como TSV o JSON
- Ver la URL de la petición realizada
- Consultar documentación de la API
