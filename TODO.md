# TODO - Frontend API Explorer para ADBA

## Estado: En progreso

---

## Fase 1: Corrección de ADBA (COMPLETADO)
- [x] Actualizar ADBA a v1.0.26
- [x] Crear endpoint `/meta` personalizado en `src/index.ts`
- [x] Normalizar nombres de tabla (guiones → guiones bajos)
- [x] Configurar `API_PATH_PREFIX=/api`
- [x] Servir archivos estáticos desde `public/`

---

## Fase 2: Backend (src/index.ts)
- [x] Crear endpoint `/meta` personalizado
- [x] Configurar `API_PATH_PREFIX=/api`
- [x] Servir archivos estáticos desde `public/`
- [x] Rebuild y probar cambios

### Verificación:
```bash
curl http://localhost:3000/api/cfdi-40-paises/meta  # ✓ Funciona
curl http://localhost:3000/api/cfdi-40-paises/?limit=2  # ✓ Funciona
curl http://localhost:3000/  # ✓ Sirve index.html
```

---

## Fase 3: Frontend (public/) - COMPLETADO
- [x] Crear carpeta `public/` con estructura:
  - `public/index.html`
  - `public/css/styles.css`
  - `public/js/app.js`

### Funcionalidades del Frontend:
- [x] Selector de tabla (carga desde `/api/`)
- [x] Tabla con Tabulator.js (columnas dinámicas)
- [x] Filtros:
  - [x] Búsqueda global (`q`)
  - [x] Paginación (limit/page)
  - [x] Ordenamiento (orderBy)
  - [x] Filtros por columna (`filters[col]`)
- [x] Mostrar estructura de tabla desde `/meta`
- [x] Visualizador JSON con highlighting
- [x] Ejemplos de código para desarrolladores
- [x] Referencia de filtros

---

## Fase 4: Pruebas
- [x] Probar `/api/` - listar tablas
- [x] Probar `/api/:table/meta` - estructura
- [x] Probar `/api/:table/` - datos con paginación
- [x] Probar frontend en navegador (verificar que sirve en http://localhost:3000/)
- [ ] Verificar CORS
- [ ] Probar filtros y búsqueda en el navegador

---

## Bibliotecas a usar
- Vue 3 (CDN)
- Bootstrap 5 (CDN)
- Tabulator.js (CDN)
- Highlight.js (CDN) - JSON highlighting
- Axios (CDN)

---

## Notas
- API_BASE = `/api`
- ADBA usa formato `{ success, data, total, page, limit }` para respuestas
- Endpoint `/meta` devuelve columnas con `{ name, type, nullable, primaryKey }`
- Nombres de tabla usan guiones: `cfdi-40-paises` (no `cfdi_40_paises`)
- Los modelos internos usan guiones bajos: `cfdi_40_paises`
