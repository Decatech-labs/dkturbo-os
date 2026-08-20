import {
  type Kysely,
  sql,
} from 'kysely';

export async function up(
  db: Kysely<unknown>,
): Promise<void> {
  await sql`
    alter table infra.nodes
    rename constraint nodes_hostname_key
    to nodes_hostname_unique
  `.execute(db);
}

export async function down(
  db: Kysely<unknown>,
): Promise<void> {
  await sql`
    alter table infra.nodes
    rename constraint nodes_hostname_unique
    to nodes_hostname_key
  `.execute(db);
}
