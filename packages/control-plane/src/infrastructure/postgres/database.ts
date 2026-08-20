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
  'infra.node_observed_state': InfraNodeObservedStateTable;
  'infra.node_capabilities': InfraNodeCapabilityTable;
  'infra.services': InfraServiceTable;
  'infra.service_instances': InfraServiceInstanceTable;
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

export interface InfraNodeObservedStateTable {
  node_id: string;
  last_seen_at: ColumnType<Date, Date, Date>;
}

export interface InfraNodeCapabilityTable {
  node_id: string;
  capability_key: string;
  registered_at: ColumnType<Date, Date, never>;
}

export interface InfraServiceTable {
  id: string;
  key: string;
  name: string;
  created_at: ColumnType<Date, Date, never>;
}

export interface InfraServiceInstanceTable {
  id: string;
  key: string;
  service_id: string;
  node_id: string;
  environment: string;
  created_at: ColumnType<Date, Date, never>;
}