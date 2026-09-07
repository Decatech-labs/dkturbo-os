import {
  createBetterAuth,
  createControlPlane,
  createDatabase,
  loadConfig,
} from '../packages/control-plane/src/index.js';

const requireEnv = (
  name: string,
): string => {
  const value =
    process.env[name];

  if (!value) {
    throw new Error(
      `${name} is required`,
    );
  }

  return value;
};

const main =
  async (): Promise<void> => {
    const config =
      loadConfig();

    const ownerPassword =
      requireEnv(
        'BOOTSTRAP_OWNER_PASSWORD',
      );

    const database =
      createDatabase({
        connectionString:
          config.DATABASE_URL,
      });

    const controlPlane =
      createControlPlane({
        database,
      });

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

        trustedOrigins:
          config
            .BETTER_AUTH_TRUSTED_ORIGINS
            ?.split(',')
            .map(
              (origin) =>
                origin.trim(),
            )
            .filter(Boolean),
      });

    try {
      await controlPlane
        .identity
        .bootstrapOwner
        .execute({
          id:
            config
              .BOOTSTRAP_OWNER_ID!,

          name:
            config
              .BOOTSTRAP_OWNER_NAME!,
        });

      const existing =
        await database
          .selectFrom(
            'auth.user',
          )
          .select([
            'id',
            'email',
          ])
          .where(
            'email',
            '=',
            config
              .BOOTSTRAP_OWNER_EMAIL!,
          )
          .executeTakeFirst();

      if (existing) {
        if (
          existing.id !==
          config
            .BOOTSTRAP_OWNER_ID
        ) {
          throw new Error(
            'Existing Better Auth owner email has unexpected id',
          );
        }

        console.log(
          'Owner auth account already exists.',
        );

        return;
      }

      const result =
        await betterAuth
          .familyAuthProvisioner
          .createUser({
            email:
              config
                .BOOTSTRAP_OWNER_EMAIL!,

            password:
              ownerPassword,

            name:
              config
                .BOOTSTRAP_OWNER_NAME!,
          });

      if (
        result.id !==
        config.BOOTSTRAP_OWNER_ID
      ) {
        throw new Error(
          'Created Better Auth owner has unexpected id',
        );
      }

      console.log(
        'Owner auth account created.',
      );
    } finally {
      await betterAuth.close();
      await database.destroy();
    }
  };

void main();
