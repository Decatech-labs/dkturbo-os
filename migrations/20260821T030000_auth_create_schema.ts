import type { Kysely } from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .createSchema('auth')
    .ifNotExists()
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .dropSchema('auth')
    .ifExists()
    .cascade()
    .execute();
}
