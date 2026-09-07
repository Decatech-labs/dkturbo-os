import type {
  Kysely,
} from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('auth')
    .alterTable('user')
    .addColumn(
      'role',
      'text',
    )
    .addColumn(
      'banned',
      'boolean',
    )
    .addColumn(
      'banReason',
      'text',
    )
    .addColumn(
      'banExpires',
      'timestamptz',
    )
    .execute();

  await db.schema
    .withSchema('auth')
    .alterTable('session')
    .addColumn(
      'impersonatedBy',
      'text',
    )
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('auth')
    .alterTable('session')
    .dropColumn(
      'impersonatedBy',
    )
    .execute();

  await db.schema
    .withSchema('auth')
    .alterTable('user')
    .dropColumn(
      'banExpires',
    )
    .dropColumn(
      'banReason',
    )
    .dropColumn(
      'banned',
    )
    .dropColumn(
      'role',
    )
    .execute();
}
