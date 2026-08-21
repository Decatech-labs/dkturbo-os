import type { Kysely } from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('actions')
    .createTable('action_executions')
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey(),
    )
    .addColumn('action_request_id', 'uuid', (column) =>
      column
        .notNull()
        .references('actions.action_requests.id')
        .onDelete('cascade'),
    )
    .addColumn('node_id', 'uuid', (column) =>
      column
        .notNull()
        .references('infra.nodes.id')
        .onDelete('restrict'),
    )
    .addColumn('required_capability', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('status', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('created_at', 'timestamptz', (column) =>
      column.notNull(),
    )
    .addUniqueConstraint(
      'action_executions_action_request_unique',
      ['action_request_id'],
    )
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('actions')
    .dropTable('action_executions')
    .execute();
}
