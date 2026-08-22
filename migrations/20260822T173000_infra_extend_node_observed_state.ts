import type { Kysely } from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .alterTable('node_observed_state')
    .addColumn(
      'runtime_collected_at',
      'timestamptz',
    )
    .addColumn(
      'runtime_snapshot',
      'jsonb',
    )
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('infra')
    .alterTable('node_observed_state')
    .dropColumn('runtime_snapshot')
    .dropColumn('runtime_collected_at')
    .execute();
}
