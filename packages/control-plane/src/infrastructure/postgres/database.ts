import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

export type Database = Record<never, never>;

export interface CreateDatabaseOptions {
  connectionString: string;
}

export const createDatabase = ({
  connectionString,
}: CreateDatabaseOptions): Kysely<Database> => {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString,
    }),
  });

  return new Kysely<Database>({
    dialect,
  });
};
