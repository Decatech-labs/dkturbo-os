import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .createTable('node_access_endpoints')
    .addColumn('id', 'uuid', (column) =>
      column
        .primaryKey()
        .notNull()
        .defaultTo(
          sql`pg_catalog.gen_random_uuid()`,
        ),
    )
    .addColumn('node_id', 'uuid', (column) =>
      column
        .notNull()
        .references('infra.nodes.id')
        .onDelete('cascade'),
    )
    .addColumn('transport', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('label', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('host', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('port', 'integer', (column) =>
      column.notNull().defaultTo(22),
    )
    .addColumn('username', 'text', (column) =>
      column.notNull(),
    )
    .addColumn('priority', 'integer', (column) =>
      column.notNull().defaultTo(100),
    )
    .addColumn('enabled', 'boolean', (column) =>
      column.notNull().defaultTo(true),
    )
    .addColumn(
      'created_at',
      'timestamptz',
      (column) =>
        column
          .notNull()
          .defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addUniqueConstraint(
      'node_access_endpoints_node_label_unique',
      ['node_id', 'label'],
    )
    .execute();

  await db.schema
    .withSchema('infra')
    .createIndex(
      'node_access_endpoints_lookup_idx',
    )
    .on('node_access_endpoints')
    .columns([
      'node_id',
      'transport',
      'enabled',
      'priority',
    ])
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .dropTable('node_access_endpoints')
    .execute();
}
