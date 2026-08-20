import { existsSync, promises as fs } from 'node:fs';
import path from 'node:path';
import { loadEnvFile } from 'node:process';

import {
  FileMigrationProvider,
  Migrator,
} from 'kysely/migration';

import {
  createDatabase,
  loadConfig,
} from '../../packages/control-plane/src/index.js';

const main = async (): Promise<void> => {
  if (
    process.env.NODE_ENV !== 'production' &&
    existsSync('.env.local')
  ) {
    loadEnvFile('.env.local');
  }

  const config = loadConfig();

  const database = createDatabase({
    connectionString: config.DATABASE_URL,
  });

  try {
    const migrator = new Migrator({
      db: database,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(process.cwd(), 'migrations'),
      }),
    });

    const { error, results } = await migrator.migrateToLatest();

    for (const result of results ?? []) {
      if (result.status === 'Success') {
        console.log(`✓ ${result.migrationName}`);
      } else if (result.status === 'Error') {
        console.error(`✗ ${result.migrationName}`);
      }
    }

    if (error) {
      console.error('Migration failed');
      console.error(error);
      process.exitCode = 1;
      return;
    }

    console.log('Database is up to date.');
  } finally {
    await database.destroy();
  }
};

void main();
