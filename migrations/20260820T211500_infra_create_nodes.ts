import type { Kysely } from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .createTable('nodes')
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey(),
    )
    .addColumn('name', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('hostname', 'text', (column) =>
      column.notNull().unique(),
    )
    .addColumn('created_at', 'timestamptz', (column) =>
      column.notNull(),
    )
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .dropTable('nodes')
    .execute();
}
