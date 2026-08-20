import type { Kysely } from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .createTable('services')
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey(),
    )
    .addColumn('key', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('name', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('created_at', 'timestamptz', (column) =>
      column.notNull(),
    )
    .addUniqueConstraint(
      'services_key_unique',
      ['key'],
    )
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .dropTable('services')
    .execute();
}
