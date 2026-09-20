import {
  checkDatabase,
  createControlPlane,
  createDatabase,
  createHttpServer,
  loadConfig,
  createBetterAuth,
} from '@dkturbo/control-plane';
import { config as loadDotEnv } from 'dotenv';

import {
  createTraining,
  createTrainingDatabase,
} from '@dkturbo/training';

import {
  createNutrition,
  createNutritionDatabase,
} from '@dkturbo/nutrition';

import {
  registerTrainingRoutes,
} from './training/index.js';

import {
  registerNutritionRoutes,
} from './nutrition/index.js';

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

const trainingDatabase =
  createTrainingDatabase({
    connectionString:
      config.DATABASE_URL,
  });

const training =
  createTraining({
    database:
      trainingDatabase,
  });

const nutritionDatabase =
  createNutritionDatabase({
    connectionString:
      config.DATABASE_URL,
  });

const nutrition =
  createNutrition({
    database:
      nutritionDatabase,
  });

const controlPlane = createControlPlane({
  database,
});

const trustedOrigins =
  config.BETTER_AUTH_TRUSTED_ORIGINS
    ?.split(',')
    .map(
      (origin) =>
        origin.trim(),
    )
    .filter(Boolean);

const betterAuth =
  createBetterAuth({
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

    ...(trustedOrigins
      ? {
          trustedOrigins,
        }
      : {}),
  });

const app = createHttpServer({
  database,

  controlPlane,

  auth:
    betterAuth.auth,

  familyAuthProvisioner:
    betterAuth
      .familyAuthProvisioner,

    registerRoutes:
    (http) => {
      registerTrainingRoutes({
        http,
        training,
      });

      registerNutritionRoutes({
        http,
        nutrition,

        listPeople:
          async () => {

            const users =
              await controlPlane
                .identity
                .listUsers
                .execute();

            return users.map(
              (user) => ({
                id:
                  user.id,

                name:
                  user.name,
              }),
            );
          },
      });
    },
});

const shutdown = async () => {
  await app.close();
  await betterAuth.close();
  await nutritionDatabase.destroy();
  await trainingDatabase.destroy();
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
    await nutritionDatabase.destroy();
    await trainingDatabase.destroy();
    await database.destroy();
    process.exit(1);
  }
};

await start();
