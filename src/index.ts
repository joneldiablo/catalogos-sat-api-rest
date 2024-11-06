import express from 'express';
import Knex from 'knex';
import morgan from 'morgan';
import cors from 'cors';

import { expressRouter, routesObject, generateSQLiteModels } from 'adba';

// Configuración de Knex para SQLite
const knexInstance = Knex({
  client: 'sqlite3',
  connection: {
    filename: './sat-catalogs/catalogs.db'
  },
  useNullAsDefault: true,
});

const startServer = async () => {
  const app = express();
  const port = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  const models = await generateSQLiteModels(knexInstance);

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
  app.use('/api', expressRouter(myRoutesObject, { debugLog: process.env.ENV !== 'PROD' }));

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/api`);
  });
};

startServer().catch(err => console.error(err));
