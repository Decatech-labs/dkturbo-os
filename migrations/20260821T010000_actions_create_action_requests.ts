import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await sql`
    create schema if not exists actions
  `.execute(db);

  await db.schema
    .withSchema('actions')
    .createTable('action_requests')
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey(),
    )
    .addColumn('action_key', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('target_kind', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('target_id', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('parameters', 'jsonb', (column) =>
      column.notNull(),
    )
    .addColumn('status', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('requested_at', 'timestamptz', (column) =>
      column.notNull(),
    )
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('actions')
    .dropTable('action_requests')
    .execute();

  await sql`
    drop schema if exists actions
  `.execute(db);
}
