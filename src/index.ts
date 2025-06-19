#!/usr/bin/env node
import express from 'express';
import Knex from 'knex';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { Server } from 'http';

import { expressRouter, routesObject, generateModels } from 'adba';

import { performUpdateIfNeeded } from './download-db';

const TMP_FOLDER = process.env.TMP_FOLDER ?? './tmp';
const API_PATH_PREFIX = process.env.API_PATH_PREFIX ?? '/api';

const startServer = async () => {
  await performUpdateIfNeeded();

  // Configuración de Knex para SQLite
  const knexInstance = Knex({
    client: 'sqlite3',
    connection: {
      filename: path.join(TMP_FOLDER, 'catalogs.db')
    },
    useNullAsDefault: true,
  });
  const checkDatabase = await knexInstance.raw('SELECT 2+2 as testConn');
  console.log('database says: 2 + 2 =', checkDatabase[0].testConn);

  const app = express();
  const port = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  const models = await generateModels(knexInstance);

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
  app.use(API_PATH_PREFIX, expressRouter(myRoutesObject, { debugLog: process.env.ENV !== 'PROD' }));

  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}${API_PATH_PREFIX}`);
  });

  setTimeout(async () => {
    await shutdown(server, knexInstance);
    await startServer();
  }, 1000 * 60 * 60 * 24 * 3);
};

async function shutdown(server: Server, knexConn: Knex.Knex<any, unknown[]>) {
  console.log(`Server is shutdown`);
  await knexConn.destroy();
  return new Promise((resolve, reject) => {
    server.close((err) => err ? reject(err) : resolve(true));
  });
}

startServer();
