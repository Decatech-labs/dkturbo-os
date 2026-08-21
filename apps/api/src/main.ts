import {
  checkDatabase,
  createControlPlane,
  createDatabase,
  createHttpServer,
  loadConfig,
  createBetterAuth,
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

const betterAuth = createBetterAuth({
  databaseUrl:
    config.DATABASE_URL,

  secret:
    config.BETTER_AUTH_SECRET,

  baseUrl:
    config.BETTER_AUTH_BASE_URL,

  bootstrapOwnerId:
    config.BOOTSTRAP_OWNER_ID!,

  bootstrapOwnerEmail:
    config.BOOTSTRAP_OWNER_EMAIL!,
});

const app = createHttpServer({
  database,
  controlPlane,
  auth: betterAuth.auth,
});

const shutdown = async () => {
  await app.close();
  await betterAuth.close();
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

    if (
      config.BOOTSTRAP_OWNER_ID &&
      config.BOOTSTRAP_OWNER_NAME
    ) {
      await controlPlane.identity.bootstrapOwner.execute({
        id: config.BOOTSTRAP_OWNER_ID,
        name: config.BOOTSTRAP_OWNER_NAME,
      });
    }

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
