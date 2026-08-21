import { createBetterAuth } from './better-auth.js';

const required = (
  name: string,
): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} is required`,
    );
  }

  return value;
};

export const auth = createBetterAuth({
  databaseUrl:
    required('DATABASE_URL'),

  secret:
    required(
      'BETTER_AUTH_SECRET',
    ),

  baseUrl:
    process.env
      .BETTER_AUTH_BASE_URL ??
    'http://127.0.0.1:3001',

  bootstrapOwnerId:
    required(
      'BOOTSTRAP_OWNER_ID',
    ),

  bootstrapOwnerEmail:
    required(
      'BOOTSTRAP_OWNER_EMAIL',
    ),
}).auth;
