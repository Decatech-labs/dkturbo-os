import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('actions')
    .alterTable('action_requests')
    .addColumn('requested_by_kind', 'text')
    .addColumn('requested_by_id', 'text')
    .execute();

  await sql`
    update actions.action_requests
    set
      requested_by_kind = 'system.legacy',
      requested_by_id = 'pre-actor-ref'
    where requested_by_kind is null
       or requested_by_id is null
  `.execute(db);

  await sql`
    alter table actions.action_requests
    alter column requested_by_kind set not null,
    alter column requested_by_id set not null
  `.execute(db);
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await db.schema
    .withSchema('actions')
    .alterTable('action_requests')
    .dropColumn('requested_by_kind')
    .dropColumn('requested_by_id')
    .execute();
}
