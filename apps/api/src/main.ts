import {
  checkDatabase,
  createControlPlane,
  createDatabase,
  createHttpServer,
  loadConfig,
} from '@dkturbo/control-plane';
import { config as loadDotEnv } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  loadDotEnv({
    path: '../../.env.local',
    quiet: true,
  });
}

const config = loadConfig();

const database = createDatabase({
  connectionString: config.DATABASE_URL,
});

const controlPlane = createControlPlane({
  database,
});

const app = createHttpServer({
  database,
  controlPlane,
});

const shutdown = async (): Promise<void> => {
  await app.close();
  await database.destroy();
};

process.on('SIGINT', () => {
  void shutdown();
});

process.on('SIGTERM', () => {
  void shutdown();
});

const start = async (): Promise<void> => {
  try {
    await checkDatabase(database);

    await app.listen({
      host: config.API_HOST,
      port: config.API_PORT,
    });
  } catch (error) {
    app.log.error(error);
    await database.destroy();
    process.exit(1);
  }
};

await start();
