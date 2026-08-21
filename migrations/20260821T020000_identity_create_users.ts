import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await sql`
    create schema if not exists identity
  `.execute(db);

  await db.schema
    .withSchema('identity')
    .createTable('users')
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey(),
    )
    .addColumn('name', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('role', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('created_at', 'timestamptz', (column) =>
      column.notNull(),
    )
    .execute();

  await sql`
    create unique index identity_single_owner
    on identity.users (role)
    where role = 'owner'
  `.execute(db);
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('identity')
    .dropTable('users')
    .execute();

  await sql`
    drop schema if exists identity
  `.execute(db);
}
