## Sqlite auto

Generate API REST from sqlite database

# Obtener la base de datos del SAT

```bash
# descargar en sat-catalogs.db.bz2
wget -O sat-catalogs.db.bz2 https://github.com/phpcfdi/resources-sat-catalogs/releases/latest/download/catalogs.db.bz2
# descomprimir en sat-catalogs.db
bunzip2 catalogs.db.bz2
```

# leer tags

```bash
GET https://api.github.com/repos/phpcfdi/resources-sat-catalogs/tags
```

respuesta:

```json
[
  {
    "name": "v9.11.20241024",
    "zipball_url": "https://api.github.com/repos/phpcfdi/resources-sat-catalogs/zipball/refs/tags/v9.11.20241024",
    "tarball_url": "https://api.github.com/repos/phpcfdi/resources-sat-catalogs/tarball/refs/tags/v9.11.20241024",
    "commit": {
      "sha": "13839e4fcc7db1e9df9a36a65250984f38789ed3",
      "url": "https://api.github.com/repos/phpcfdi/resources-sat-catalogs/commits/13839e4fcc7db1e9df9a36a65250984f38789ed3"
    },
    "node_id": "MDM6UmVmMjc3MDQwNjAyOnJlZnMvdGFncy92OS4xMS4yMDI0MTAyNA=="
  },
  ....
]
```
