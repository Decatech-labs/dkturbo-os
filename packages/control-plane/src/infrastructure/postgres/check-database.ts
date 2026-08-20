import { sql, type Kysely } from 'kysely';

import type { Database } from './database.js';

export const checkDatabase = async (
  database: Kysely<Database>,
): Promise<void> => {
  await sql`select 1`.execute(database);
};
