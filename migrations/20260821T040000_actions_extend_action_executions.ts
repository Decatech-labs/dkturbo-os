import type { Kysely } from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('actions')
    .alterTable('action_executions')
    .addColumn('started_at', 'timestamptz')
    .addColumn('finished_at', 'timestamptz')
    .addColumn('result', 'jsonb')
    .addColumn('error_code', 'text')
    .addColumn('error_message', 'text')
    .execute();
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('actions')
    .alterTable('action_executions')
    .dropColumn('error_message')
    .dropColumn('error_code')
    .dropColumn('result')
    .dropColumn('finished_at')
    .dropColumn('started_at')
    .execute();
}
