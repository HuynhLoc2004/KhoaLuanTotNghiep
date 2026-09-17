import mongoose from 'mongoose';
import { Client } from 'pg';

async function testMongo() {
  const uris = [
    'mongodb://localhost:27017/museum',
    'mongodb://museum_admin:change-me-mongo@localhost:27018/museum?authSource=admin'
  ];
  for (const uri of uris) {
    try {
      console.log('Testing Mongo URI:', uri);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log('MONGO_SUCCESS with:', uri);
      await mongoose.disconnect();
      return uri;
    } catch (e: any) {
      console.log('Mongo failed on', uri, ':', e.message);
    }
  }
}

async function testPostgres() {
  const configs = [
    { host: 'localhost', port: 5432, user: 'postgres', password: 'change-me-postgres', database: 'museum' },
    { host: 'localhost', port: 5432, user: 'postgres', database: 'postgres' },
    { host: 'localhost', port: 15432, user: 'museum_app', password: 'change-me-postgres', database: 'museum' }
  ];
  for (const cfg of configs) {
    try {
      console.log('Testing PG config:', cfg.host, cfg.port, cfg.user, cfg.database);
      const client = new Client({ ...cfg, connectionTimeoutMillis: 2000 });
      await client.connect();
      console.log('POSTGRES_SUCCESS with:', cfg.user, cfg.port);
      await client.end();
      return cfg;
    } catch (e: any) {
      console.log('PG failed with', cfg.port, cfg.user, ':', e.message);
    }
  }
}

async function run() {
  await testMongo();
  await testPostgres();
}

run();
