import type { Kysely } from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .createSchema('authz')
    .ifNotExists()
    .execute();

  await db.schema
    .withSchema('authz')
    .createTable('approval_requests')
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey(),
    )
    .addColumn('action_request_id', 'uuid', (column) =>
      column
        .notNull()
        .references('actions.action_requests.id')
        .onDelete('cascade'),
    )
    .addColumn('status', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('requested_at', 'timestamptz', (column) =>
      column.notNull(),
    )
    .addColumn('decided_at', 'timestamptz')
    .addColumn('decided_by_kind', 'text')
    .addColumn('decided_by_id', 'text')
    .addUniqueConstraint(
      'approval_requests_action_request_unique',
      ['action_request_id'],
    )
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('authz')
    .dropTable('approval_requests')
    .execute();

  await db.schema
    .dropSchema('authz')
    .ifExists()
    .execute();
}
