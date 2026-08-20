import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`create schema infra`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`drop schema infra`.execute(db);
}
