import type { Kysely } from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .createTable('service_instances')
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey(),
    )
    .addColumn('key', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('service_id', 'uuid', (column) =>
      column
        .notNull()
        .references('infra.services.id')
        .onDelete('cascade'),
    )
    .addColumn('node_id', 'uuid', (column) =>
      column
        .notNull()
        .references('infra.nodes.id')
        .onDelete('cascade'),
    )
    .addColumn('environment', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('created_at', 'timestamptz', (column) =>
      column.notNull(),
    )
    .addUniqueConstraint(
      'service_instances_key_unique',
      ['key'],
    )
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .dropTable('service_instances')
    .execute();
}
