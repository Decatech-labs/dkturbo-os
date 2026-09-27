import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db:
    Kysely<unknown>,
): Promise<void> {

  await db.schema
    .createTable(
      'nutrition.person_access',
    )
    .addColumn(
      'id',
      'uuid',
      column =>
        column
          .primaryKey()
          .defaultTo(
            sql`pg_catalog.gen_random_uuid()`,
          ),
    )
    .addColumn(
      'grantee_user_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'identity.users.id',
          )
          .onDelete(
            'cascade',
          ),
    )
    .addColumn(
      'subject_user_id',
      'uuid',
      column =>
        column
          .notNull()
          .references(
            'identity.users.id',
          )
          .onDelete(
            'cascade',
          ),
    )
    .addColumn(
      'role',
      'text',
      column =>
        column.notNull(),
    )
    .addColumn(
      'created_at',
      'timestamptz',
      column =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      column =>
        column
          .notNull()
          .defaultTo(
            sql`CURRENT_TIMESTAMP`,
          ),
    )
    .addUniqueConstraint(
      'nutrition_person_access_grantee_subject_unique',
      [
        'grantee_user_id',
        'subject_user_id',
      ],
    )
    .addCheckConstraint(
      'nutrition_person_access_role_check',
      sql`
        role IN (
          'VIEWER',
          'MANAGER'
        )
      `,
    )
    .addCheckConstraint(
      'nutrition_person_access_not_self_check',
      sql`
        grantee_user_id <>
        subject_user_id
      `,
    )
    .execute();

  await db.schema
    .createIndex(
      'nutrition_person_access_grantee_idx',
    )
    .on(
      'nutrition.person_access',
    )
    .column(
      'grantee_user_id',
    )
    .execute();

  await db.schema
    .createIndex(
      'nutrition_person_access_subject_idx',
    )
    .on(
      'nutrition.person_access',
    )
    .column(
      'subject_user_id',
    )
    .execute();
}

export async function down(
  db:
    Kysely<unknown>,
): Promise<void> {

  await db.schema
    .dropTable(
      'nutrition.person_access',
    )
    .execute();
}
