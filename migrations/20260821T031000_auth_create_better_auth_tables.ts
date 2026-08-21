import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('auth')
    .createTable('user')
    .addColumn('id', 'uuid', (column) =>
      column
        .primaryKey()
        .notNull()
        .defaultTo(
          sql`pg_catalog.gen_random_uuid()`,
        ),
    )
    .addColumn('name', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('email', 'text', (column) =>
      column.notNull().unique(),
    )
    .addColumn(
      'emailVerified',
      'boolean',
      (column) => column.notNull(),
    )
    .addColumn('image', 'text')
    .addColumn(
      'createdAt',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addColumn(
      'updatedAt',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .execute();

  await db.schema
    .withSchema('auth')
    .createTable('session')
    .addColumn('id', 'uuid', (column) =>
      column
        .primaryKey()
        .notNull()
        .defaultTo(
          sql`pg_catalog.gen_random_uuid()`,
        ),
    )
    .addColumn(
      'expiresAt',
      'timestamptz',
      (column) => column.notNull(),
    )
    .addColumn('token', 'text', (column) =>
      column.notNull().unique(),
    )
    .addColumn(
      'createdAt',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addColumn(
      'updatedAt',
      'timestamptz',
      (column) => column.notNull(),
    )
    .addColumn('ipAddress', 'text')
    .addColumn('userAgent', 'text')
    .addColumn('userId', 'uuid', (column) =>
      column
        .notNull()
        .references('auth.user.id')
        .onDelete('cascade'),
    )
    .execute();

  await db.schema
    .withSchema('auth')
    .createTable('account')
    .addColumn('id', 'uuid', (column) =>
      column
        .primaryKey()
        .notNull()
        .defaultTo(
          sql`pg_catalog.gen_random_uuid()`,
        ),
    )
    .addColumn('issuer', 'text', (column) =>
      column.notNull(),
    )
    .addColumn(
      'accountId',
      'text',
      (column) => column.notNull(),
    )
    .addColumn(
      'providerId',
      'text',
      (column) => column.notNull(),
    )
    .addColumn('userId', 'uuid', (column) =>
      column
        .notNull()
        .references('auth.user.id')
        .onDelete('cascade'),
    )
    .addColumn('accessToken', 'text')
    .addColumn('refreshToken', 'text')
    .addColumn('idToken', 'text')
    .addColumn(
      'accessTokenExpiresAt',
      'timestamptz',
    )
    .addColumn(
      'refreshTokenExpiresAt',
      'timestamptz',
    )
    .addColumn('scope', 'text')
    .addColumn('password', 'text')
    .addColumn(
      'createdAt',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addColumn(
      'updatedAt',
      'timestamptz',
      (column) => column.notNull(),
    )
    .execute();

  await db.schema
    .withSchema('auth')
    .createTable('verification')
    .addColumn('id', 'uuid', (column) =>
      column
        .primaryKey()
        .notNull()
        .defaultTo(
          sql`pg_catalog.gen_random_uuid()`,
        ),
    )
    .addColumn(
      'identifier',
      'text',
      (column) => column.notNull(),
    )
    .addColumn('value', 'text', (column) =>
      column.notNull(),
    )
    .addColumn(
      'expiresAt',
      'timestamptz',
      (column) => column.notNull(),
    )
    .addColumn(
      'createdAt',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addColumn(
      'updatedAt',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .execute();

  await db.schema
    .withSchema('auth')
    .createIndex('session_userId_idx')
    .on('session')
    .column('userId')
    .execute();

  await db.schema
    .withSchema('auth')
    .createIndex('account_userId_idx')
    .on('account')
    .column('userId')
    .execute();

  await db.schema
    .withSchema('auth')
    .createIndex(
      'verification_identifier_idx',
    )
    .on('verification')
    .column('identifier')
    .execute();

  await db.schema
    .withSchema('auth')
    .createIndex(
      'account_issuer_accountId_uidx',
    )
    .unique()
    .on('account')
    .columns([
      'issuer',
      'accountId',
    ])
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('auth')
    .dropTable('verification')
    .execute();

  await db.schema
    .withSchema('auth')
    .dropTable('account')
    .execute();

  await db.schema
    .withSchema('auth')
    .dropTable('session')
    .execute();

  await db.schema
    .withSchema('auth')
    .dropTable('user')
    .execute();
}
