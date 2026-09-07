import {
  betterAuth,
} from 'better-auth';

import {
  admin,
} from 'better-auth/plugins';

import {
  Pool,
} from 'pg';

export interface CreateBetterAuthInput {
  databaseUrl: string;
  secret: string;
  baseUrl: string;
  bootstrapOwnerId: string;
  bootstrapOwnerEmail: string;
  trustedOrigins?: string[];
}

const withAuthSearchPath = (
  databaseUrl: string,
): string => {
  const url =
    new URL(
      databaseUrl,
    );

  url.searchParams.set(
    'options',
    '-c search_path=auth',
  );

  return url.toString();
};

export const createBetterAuth = ({
  databaseUrl,
  secret,
  baseUrl,
  bootstrapOwnerId,
  bootstrapOwnerEmail,
  trustedOrigins = [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
  ]
}: CreateBetterAuthInput) => {
  const ownerEmail =
    bootstrapOwnerEmail
      .trim()
      .toLowerCase();

  const pool =
    new Pool({
      connectionString:
        withAuthSearchPath(
          databaseUrl,
        ),
    });

  const auth =
    betterAuth({
      database:
        pool,

      secret,

      baseURL:
        baseUrl,

      emailAndPassword: {
        enabled:
          true,

        disableSignUp:
          true,

        autoSignIn:
          true,
      },

      databaseHooks: {
        user: {
          create: {
            before:
              async (
                user,
              ) => {
                if (
                  user.email
                    .trim()
                    .toLowerCase() ===
                  ownerEmail
                ) {
                  return {
                    data: {
                      ...user,

                      id:
                        bootstrapOwnerId,
                    },
                  };
                }

                return {
                  data:
                    user,
                };
              },
          },
        },
      },

      advanced: {
        database: {
          generateId: () =>
            crypto.randomUUID(),
        },
      },

      plugins: [
        admin({
          adminUserIds: [
            bootstrapOwnerId,
          ],

          defaultRole:
            'user',
        }),
      ],

      trustedOrigins,
    });

  return {
    auth,

    familyAuthProvisioner: {
      createUser:
        async ({
          email,
          password,
          name,
        }: {
          email: string;
          password: string;
          name: string;
        }) => {
          const result =
            await auth.api
              .createUser({
                body: {
                  email,
                  password,
                  name,
                  role:
                    'user',
                },
              });

          return {
            id:
              result.user.id,

            name:
              result.user.name,

            email:
              result.user.email,
          };
        },

      removeUser:
        async ({
          userId,
          headers,
        }: {
          userId: string;
          headers: Headers;
        }) => {
          await auth.api
            .removeUser({
              body: {
                userId,
              },

              headers,
            });
        },

        setPassword:
          async ({
            userId,
            newPassword,
            headers,
          }: {
            userId: string;
            newPassword: string;
            headers: Headers;
          }) => {
            await auth.api
              .setUserPassword({
                body: {
                  userId,
                  newPassword,
                },

                headers,
              });
          },

        revokeSessions:
          async ({
            userId,
            headers,
          }: {
            userId: string;
            headers: Headers;
          }) => {
            await auth.api
              .revokeUserSessions({
                body: {
                  userId,
                },

                headers,
              });
          },
    },

    close:
      async () => {
        await pool.end();
      },
  };
};