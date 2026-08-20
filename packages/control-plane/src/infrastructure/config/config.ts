import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  API_HOST: z.string().min(1).default('127.0.0.1'),
  API_PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().min(1),
});

export type Config = z.infer<typeof configSchema>;

export const parseConfig = (
  environment: NodeJS.ProcessEnv,
): Config => {
  return configSchema.parse(environment);
};
