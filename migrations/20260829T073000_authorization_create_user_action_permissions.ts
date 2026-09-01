import type {
  Kysely,
} from 'kysely';

export async function up(
  database: Kysely<unknown>,
): Promise<void> {
  await database.schema
    .withSchema('authz')
    .createTable(
      'user_action_permissions',
    )
    .addColumn(
      'id',
      'uuid',
      (column) =>
        column.primaryKey(),
    )
    .addColumn(
      'user_id',
      'uuid',
      (column) =>
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
      'action_key',
      'text',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'target_kind',
      'text',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'target_id',
      'text',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'granted_by_user_id',
      'uuid',
      (column) =>
        column
          .notNull()
          .references(
            'identity.users.id',
          ),
    )
    .addColumn(
      'granted_at',
      'timestamptz',
      (column) =>
        column.notNull(),
    )
    .addUniqueConstraint(
      'user_action_permissions_unique',
      [
        'user_id',
        'action_key',
        'target_kind',
        'target_id',
      ],
    )
    .execute();
}

export async function down(
  database: Kysely<unknown>,
): Promise<void> {
  await database.schema
    .withSchema('authz')
    .dropTable(
      'user_action_permissions',
    )
    .execute();
}
