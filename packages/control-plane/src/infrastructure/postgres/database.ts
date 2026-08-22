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
  'actions.action_requests': ActionsActionRequestTable;
  'identity.users': IdentityUserTable;
  'authz.approval_requests': AuthorizationApprovalRequestTable;
  'actions.action_executions': ActionsActionExecutionTable;
  'infra.node_access_endpoints': InfraNodeAccessEndpointTable;
  'infra.service_runtime_bindings': InfraServiceRuntimeBindingTable;
  'infra.service_instance_observed_state': InfraServiceInstanceObservedStateTable;
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
  runtime_collected_at: ColumnType<
    Date | null,
    Date | null,
    Date | null
  >;
  runtime_snapshot: unknown | null;
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

export interface InfraServiceRuntimeBindingTable {
  service_instance_id: string;
  runtime_kind: string;
  resource_name: string;
  created_at: ColumnType<Date, Date, never>;
}

export interface InfraServiceInstanceObservedStateTable {
  service_instance_id: string;
  collected_at: ColumnType<
    Date,
    Date,
    Date
  >;
  runtime_snapshot: unknown;
}

export interface ActionsActionRequestTable {
  id: string;
  action_key: string;
  target_kind: string;
  target_id: string;
  requested_by_kind: string;
  requested_by_id: string;
  parameters: unknown;
  status: string;
  requested_at: ColumnType<Date, Date, never>;
}

export interface IdentityUserTable {
  id: string;
  name: string;
  role: string;
  created_at: ColumnType<Date, Date, never>;
}

export interface AuthorizationApprovalRequestTable {
  id: string;
  action_request_id: string;
  status: string;
  requested_at: ColumnType<Date, Date, never>;
  decided_at: ColumnType<
    Date | null,
    Date | null,
    Date | null
  >;
  decided_by_kind: string | null;
  decided_by_id: string | null;
}

export interface ActionsActionExecutionTable {
  id: string;
  action_request_id: string;
  node_id: string;
  required_capability: string;
  status: string;
  created_at: ColumnType<Date, Date, never>;

  started_at: ColumnType<
    Date | null,
    Date | null,
    Date | null
  >;

  finished_at: ColumnType<
    Date | null,
    Date | null,
    Date | null
  >;

  result: unknown | null;
  error_code: string | null;
  error_message: string | null;
}

export interface InfraNodeAccessEndpointTable {
  id: string;
  node_id: string;
  transport: string;
  label: string;
  host: string;
  port: number;
  username: string;
  priority: number;
  enabled: boolean;
  created_at: ColumnType<Date, Date, never>;
}