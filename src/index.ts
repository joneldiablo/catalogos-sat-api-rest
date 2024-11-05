import express from 'express';
import Knex from 'knex';
import morgan from 'morgan';
import cors from 'cors';

import expressRouter, { routesObject } from 'adba/src/express-router';
import { generateModels } from 'adba/src/generate-sqlite-models';

// Configuración de Knex para SQLite
const knexInstance = Knex({
  client: 'sqlite3',
  connection: {
    filename: './sat-catalogs/catalogs.db'
  },
  useNullAsDefault: true,
});

// Generar modelos dinámicamente
const setupModels = async () => {
  try {
    return await generateModels(knexInstance);
  } catch (err) {
    console.error('Error al generar modelos:', err);
    process.exit(1);
  }
};

const startServer = async () => {
  const app = express();
  const port = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  const models = await setupModels();

  // Crear el objeto de rutas usando los modelos
  const myRoutesObject = routesObject(models, {}, {
    filters: {
      defaultAction: 'includes',
      '*': {
        defaultAction: 'excludes',
        'GET /': true
      }
    }
  });

  // Configurar el enrutador de express según el objeto de rutas
  app.use('/api', expressRouter(myRoutesObject));

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/api`);
  });
};

startServer().catch(err => console.error(err));
