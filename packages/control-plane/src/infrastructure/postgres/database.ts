import type { ColumnType } from 'kysely';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

export interface InfraNodeTable {
  id: string;
  name: string;
  hostname: string;
  created_at: ColumnType<Date, Date, never>;
}

export interface Database {
  'infra.nodes': InfraNodeTable;
}

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
