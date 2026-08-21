import type { Kysely } from 'kysely';

import type { Database } from '../../../../infrastructure/postgres/database.js';
import type {
  User,
  UserId,
  UserRole,
} from '../../domain/user.js';
import type { UserRepository } from '../../ports/user-repository.port.js';

export class PostgresUserRepository
  implements UserRepository
{
  constructor(
    private readonly database: Kysely<Database>,
  ) {}

  async saveIfAbsent(
    user: User,
  ): Promise<void> {
    await this.database
      .insertInto('identity.users')
      .values({
        id: user.id,
        name: user.name,
        role: user.role,
        created_at: user.createdAt,
      })
      .onConflict((conflict) =>
        conflict.column('id').doNothing(),
      )
      .execute();
  }

  async findById(
    id: UserId,
  ): Promise<User | null> {
    const row = await this.database
      .selectFrom('identity.users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      id: row.id as UserId,
      name: row.name,
      role: row.role as UserRole,
      createdAt: row.created_at,
    };
  }
}
