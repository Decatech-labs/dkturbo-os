import type { Kysely } from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .createTable('service_runtime_bindings')
    .addColumn(
      'service_instance_id',
      'uuid',
      (column) =>
        column
          .primaryKey()
          .references(
            'infra.service_instances.id',
          )
          .onDelete('cascade'),
    )
    .addColumn(
      'runtime_kind',
      'text',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'resource_name',
      'text',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'created_at',
      'timestamptz',
      (column) =>
        column.notNull(),
    )
    .execute();

  await db.schema
    .withSchema('infra')
    .createTable(
      'service_instance_observed_state',
    )
    .addColumn(
      'service_instance_id',
      'uuid',
      (column) =>
        column
          .primaryKey()
          .references(
            'infra.service_instances.id',
          )
          .onDelete('cascade'),
    )
    .addColumn(
      'collected_at',
      'timestamptz',
      (column) =>
        column.notNull(),
    )
    .addColumn(
      'runtime_snapshot',
      'jsonb',
      (column) =>
        column.notNull(),
    )
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .dropTable(
      'service_instance_observed_state',
    )
    .execute();

  await db.schema
    .withSchema('infra')
    .dropTable(
      'service_runtime_bindings',
    )
    .execute();
}
