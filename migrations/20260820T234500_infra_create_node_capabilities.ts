import type { Kysely } from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .createTable('node_capabilities')
    .addColumn('node_id', 'uuid', (column) =>
      column
        .notNull()
        .references('infra.nodes.id')
        .onDelete('cascade'),
    )
    .addColumn('capability_key', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('registered_at', 'timestamptz', (column) =>
      column.notNull(),
    )
    .addPrimaryKeyConstraint(
      'node_capabilities_pkey',
      ['node_id', 'capability_key'],
    )
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .dropTable('node_capabilities')
    .execute();
}
