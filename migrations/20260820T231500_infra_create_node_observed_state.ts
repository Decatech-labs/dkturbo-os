import type { Kysely } from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .createTable('node_observed_state')
    .addColumn('node_id', 'uuid', (column) =>
      column
        .primaryKey()
        .references('infra.nodes.id')
        .onDelete('cascade'),
    )
    .addColumn('last_seen_at', 'timestamptz', (column) =>
      column.notNull(),
    )
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .dropTable('node_observed_state')
    .execute();
}
