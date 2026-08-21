import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  API_HOST: z.string().min(1).default('127.0.0.1'),
  API_PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().min(1),

  BOOTSTRAP_OWNER_ID: z.string().uuid().optional(),

  BOOTSTRAP_OWNER_NAME: z.string().trim().min(1).optional(),

  BETTER_AUTH_SECRET: z.string().min(32),

  BETTER_AUTH_BASE_URL: z.string().url().default(
    'http://127.0.0.1:3001',
  ),

  BOOTSTRAP_OWNER_EMAIL: z.string().email().optional(),
});

export type Config = z.infer<typeof configSchema>;

export const parseConfig = (
  environment: NodeJS.ProcessEnv,
): Config => {
  return configSchema.parse(environment);
};
