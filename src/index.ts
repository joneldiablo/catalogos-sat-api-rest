#!/usr/bin/env node
import express from 'express';
import type { Request, Response } from 'express';
import Knex from 'knex';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { Server } from 'http';

import { expressRouter, routesObject, generateModels } from 'adba';

import { performUpdateIfNeeded } from './download-db';

const TMP_FOLDER = process.env.TMP_FOLDER ?? './tmp';
const API_PATH_PREFIX = process.env.API_PATH_PREFIX ?? '/api';
const ENABLE_FRONTEND = process.env.ENABLE_FRONTEND === 'true' || process.env.ENABLE_FRONTEND === '1';

const startServer = async () => {
  await performUpdateIfNeeded();

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
  
  if (ENABLE_FRONTEND) {
    app.use(express.static(path.join(__dirname, '../../public')));
    console.log('Frontend enabled at /');
  } else {
    console.log('Frontend disabled (set ENABLE_FRONTEND=1 to enable)');
  }

  const models = await generateModels(knexInstance);

  const normalizeTableName = (name: string) => name.replace(/-/g, '_');

  app.get(`${API_PATH_PREFIX}/:tableName/meta`, async (req: Request, res: Response) => {
    const tableName = normalizeTableName(req.params.tableName as string);
    const model = Object.values(models).find((m: any) => m.tableName === tableName);
    
    if (!model) {
      res.status(404).json({ status: 404, code: 404, description: 'Table not found', data: null });
      return;
    }

    const schema = (model as any).jsonSchema || {};
    const columns: Array<{ name: string; type: string; nullable: boolean; primaryKey: boolean }> = [];
    
    if (schema.properties) {
      for (const [name, prop] of Object.entries(schema.properties as Record<string, any>)) {
        const cleanName = name.startsWith('x-') ? name.slice(2) : name;
        columns.push({ name: cleanName, type: prop.type || 'string', nullable: !schema.required?.includes(cleanName), primaryKey: false });
      }
    }

    try {
      const result = await knexInstance.raw(`PRAGMA table_info("${tableName}")`);
      const rows = result.rows || result;
      for (const row of rows as Array<{ name: string; pk: number }>) {
        const col = columns.find(c => c.name === row.name);
        if (col && row.pk) col.primaryKey = true;
      }
      res.json({ success: true, error: false, status: 200, code: 0, description: 'ok', data: columns });
    } catch (err: any) {
      res.status(500).json({ status: 500, code: 0, description: 'internal-server-error', data: err.message });
    }
  });

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
