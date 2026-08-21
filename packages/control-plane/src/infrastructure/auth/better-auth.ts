import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { Pool } from 'pg';

export interface CreateBetterAuthInput {
  databaseUrl: string;
  secret: string;
  baseUrl: string;
  bootstrapOwnerId: string;
  bootstrapOwnerEmail: string;
}

const withAuthSearchPath = (
  databaseUrl: string,
): string => {
  const url = new URL(databaseUrl);

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
}: CreateBetterAuthInput) => {
  const ownerEmail =
    bootstrapOwnerEmail
      .trim()
      .toLowerCase();

  const pool = new Pool({
    connectionString:
      withAuthSearchPath(databaseUrl),
  });

  const auth = betterAuth({
    database: pool,

    secret,

    baseURL: baseUrl,

    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },

    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (
              user.email
                .trim()
                .toLowerCase() !==
              ownerEmail
            ) {
              throw new APIError(
                'FORBIDDEN',
                {
                  message:
                    'Signup is not enabled for this user',
                },
              );
            }

            return {
              data: user,
            };
          },
        },
      },
    },

    advanced: {
      database: {
        generateId: ({
          model,
        }) => {
          if (model === 'user') {
            return bootstrapOwnerId;
          }

          return crypto.randomUUID();
        },
      },
    },

    trustedOrigins: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
    ],
  });

  return {
    auth,

    close: async () => {
      await pool.end();
    },
  };
};

export type BetterAuthInstance =
  ReturnType<
    typeof createBetterAuth
  >['auth'];
