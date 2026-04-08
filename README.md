# SAT Catalogs API REST

API REST auto-generada a partir de la base de datos de catálogos oficiales del SAT (Servicio de Administración Tributaria de México).

Los datos se descargan automáticamente del repositorio [phpcfdi/resources-sat-catalogs](https://github.com/phpcfdi/resources-sat-catalogs) al iniciar el servidor.

## Características

- **API REST completa** con filtros, búsqueda, paginación y ordenamiento
- **Catálogos CFDI 4.0, 3.3** y complementos (Nóminas, Pagos, Carta Porte, Comercio Exterior, etc.)
- **API Explorer** interactivo con navegador de datos y ejemplos de código
- **Descarga automática** de la base de datos desde GitHub
- **Autenticación GitHub** configurable para mayor límite de requests

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Inicio rápido

```bash
npm start
```

El servidor inicia en `http://localhost:3000`. Si `ENABLE_FRONTEND=1`, la interfaz web está disponible en la raíz `/`.

## Configuración

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto del servidor HTTP |
| `API_PATH_PREFIX` | `/api` | Prefijo de todas las rutas de la API |
| `ENABLE_FRONTEND` | `false` | Habilitar el API Explorer en `/` |
| `GITHUB_TOKEN` | _(ninguno)_ | Token de GitHub para autenticación en la API de GitHub |
| `TMP_FOLDER` | `./tmp` | Carpeta para archivos temporales y base de datos |
| `ENV` | _(ninguno)_ | `PROD` para desactivar logs de debug; `DEV`/`DEBUG` para verbose |

### Ejemplo con todas las variables

```bash
PORT=8080 API_PATH_PREFIX=/v1 ENABLE_FRONTEND=1 GITHUB_TOKEN=ghp_xxxx npm start
```

## API REST

### Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/` | Lista de todas las tablas disponibles |
| `GET` | `/api/meta` | Lista de tablas con sus columnas y tipos |
| `GET` | `/api/:tableName` | Consulta datos de una tabla |
| `GET` | `/api/:tableName/meta` | Estructura de una tabla específica |

### Parámetros de consulta

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `limit` | int | Registros por página (default: 100) | `?limit=50` |
| `page` | int | Número de página (0-indexed) | `?page=2` |
| `q` | string | Búsqueda en todas las columnas de texto | `?q=mexico` |
| `orderBy.columna` | string | Ordenar por columna y dirección | `?orderBy.c_Nombre=asc` |
| `filters[col]` | string | Filtrar por columna exacta | `?filters[c_Estado]=OAX` |
| `filters[col][$gte]` | string | Mayor o igual que | `?filters[edad][$gte]=18` |
| `filters[col][$lt]` | string | Menor que | `?filters[precio][$lt]=100` |
| `filters[col][$ne]` | string | Diferente de | `?filters[status][$ne]=inactivo` |
| `select` | string | Seleccionar columnas específicas | `?select=id,nombre` |

### Ejemplos con curl

```bash
# Listar todas las tablas
curl http://localhost:3000/api/

# Listar países del CFDI 4.0
curl http://localhost:3000/api/cfdi-40-paises

# Buscar países que contengan "mexico"
curl "http://localhost:3000/api/cfdi-40-paises?q=mexico"

# Paginar resultados (10 por página, página 2)
curl "http://localhost:3000/api/cfdi-40-paises?limit=10&page=1"

# Ordenar por nombre (ascendente)
curl "http://localhost:3000/api/cfdi-40-paises?orderBy.c_Nombre=asc"

# Filtrar por columna exacta
curl "http://localhost:3000/api/cfdi-40-paises?filters%5Bc_ClaveDeProducto%5D=01"

# Seleccionar columnas específicas
curl "http://localhost:3000/api/cfdi-40-paises?select=c_ClavePais,c_Nombre"

# Ver estructura de una tabla
curl http://localhost:3000/api/cfdi-40-paises/meta
```

### Formato de respuesta

```json
{
  "success": true,
  "error": false,
  "status": 200,
  "code": 0,
  "description": "ok",
  "data": [
    { "id": 1, "nombre": "Valor 1" },
    { "id": 2, "nombre": "Valor 2" }
  ],
  "total": 62,
  "pageSize": 100,
  "page": 0
}
```

### Estructura de `/meta`

```json
{
  "success": true,
  "data": [
    { "name": "id", "type": "integer", "nullable": false, "primaryKey": true },
    { "name": "c_Nombre", "type": "string", "nullable": false, "primaryKey": false }
  ]
}
```

## Catálogos disponibles

### CFDI 4.0 (`cfdi-40-*`)

| Tabla | Descripción |
|-------|-------------|
| `cfdi-40-paises` | Catálogo de países |
| `cfdi-40-codigos-postales` | Códigos postales |
| `cfdi-40-colonias` | Colonias |
| `cfdi-40-municipios` | Municipios |
| `cfdi-40-estados` | Estados |
| `cfdi-40-localidades` | Localidades |
| `cfdi-40-regimenes-fiscales` | Régimenes fiscales |
| `cfdi-40-formas-pago` | Formas de pago |
| `cfdi-40-metodos-pago` | Métodos de pago |
| `cfdi-40-monedas` | Monedas |
| `cfdi-40-tipos-comprobantes` | Tipos de comprobantes |
| `cfdi-40-uses` | Usos de CFDI |

### CFDI 3.3 (`cfdi-*`)

Versión anterior de los mismos catálogos más complementos de:
- Impuestos (`cfdi-impuestos`)
- Pedimentos (`cfdi-pedimentos`)
- Conceptos (`cfdi-conceptos`)

### Comprobantes de Retenciones (`ret-20-*`)

Catálogos para CFDI de retenciones e información de pagos 2.0.

### Complemento de Pagos (`pagos-*`)

Catálogos del complemento de recepción de pagos.

### Complemento de Nóminas (`nomina-*`)

Catálogos para CFDI de nómina 1.2:
- Tipos de nómina
- Bancos
- Periodicidades de pago
- Tipos de contrato
- Riesgos de trabajo
- Empresas
- Estados
- Municipios

### Complemento de Comercio Exterior (`cce-*` y `cce-20-*`)

Catálogos para el complemento de comercio exterior 1.1 y 2.0:
- Pedimentos
- Certificados de sello digital de aduanas
- Incoterms
- Fracciones arancelarias
- Unidades de medida

### Complemento de Carta Porte (`ccp-20-*` y `ccp-30-*`)

Catálogos para el complemento de carta de porte 2.0 y 3.0:
- Tipos de transporte
- Configuración de vehículos
- Permisos
- Materiales peligrosos
- Mercancías
- Ubicaciones

## API Explorer

Cuando `ENABLE_FRONTEND=1`, se sirve una interfaz web en la raíz (`/`) con las siguientes funcionalidades:

### Funciones

- **Selector de tablas** organizado por grupos (CFDI 4.0, Nóminas, Carta Porte, etc.)
- **Vista de estructura** de tabla con columnas, tipos y primary keys
- **Filtros interactivos**: búsqueda global, paginación, ordenamiento, filtros por columna
- **Tabla de datos** con scroll horizontal, columna # estilo Excel y ordenamiento
- **Panel JSON** que muestra la respuesta cruda de la API
- **Ejemplos de código** en Fetch API, Axios y cURL
- **Referencia de filtros** con todos los parámetros disponibles
- **Copiar TSV/JSON** para exportar datos
- **Badge de estado** de conexión a la API

### Uso desde JavaScript

```javascript
// Fetch API
const response = await fetch('http://localhost:3000/api/cfdi-40-paises?limit=10');
const result = await response.json();
console.log(result.data);

// Axios
const { data } = await axios.get('http://localhost:3000/api/cfdi-40-paises', {
  params: { limit: 10, page: 0, q: 'mexico' }
});
```

## Desarrollo

```bash
# Desarrollo con hot-reload
npm run start:dev

# Compilar TypeScript (CommonJS + ESM)
npm run build

# Compilar solo CommonJS
npm run build:cjs

# Compilar solo ESM
npm run build:esm

# Generar documentación TypeDoc
npm run build

# Ejecutar pruebas
npm test

# Ejecutar pruebas end-to-end
npm run test:e2e
```

## Arquitectura

```
src/
├── index.ts          # Servidor Express + rutas API
└── download-db.ts    # Descarga BD desde GitHub

public/
├── index.html         # Template API Explorer
├── js/app.js         # Vue 3 + Tabulator
└── css/styles.css    # Estilos

tmp/
├── catalogs.db        # Base de datos SQLite
└── version.txt        # Versión actual del catálogo
```

### Flujo de datos

1. Al iniciar, `performUpdateIfNeeded()` consulta la API de GitHub para verificar la versión
2. Si hay nueva versión, descarga `catalogs.db.bz2` y lo descomprime en `tmp/`
3. Knex se conecta a la base SQLite
4. ADBA genera modelos y rutas REST automáticamente
5. El endpoint `/meta` personalizado expone la estructura de cada tabla

## Origen de datos

La base de datos se obtiene del repositorio [phpcfdi/resources-sat-catalogs](https://github.com/phpcfdi/resources-sat-catalogs).

Los tags de GitHub representan versiones de los catálogos del SAT. El servidor verifica automáticamente si hay actualizaciones al iniciar.

## Límites de GitHub API

| Sin autenticación | Con `GITHUB_TOKEN` |
|-------------------|-------------------|
| 60 requests/hora | 5,000 requests/hora |

## Licencia

ISC
