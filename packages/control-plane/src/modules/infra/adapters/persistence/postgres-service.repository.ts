import type { Kysely } from 'kysely';
import { DatabaseError } from 'pg';

import type { Database } from '../../../../infrastructure/postgres/database.js';
import { ServiceKeyAlreadyRegisteredError } from '../../application/errors/service-key-already-registered.error.js';
import type {
  Service,
  ServiceId,
  ServiceKey,
} from '../../domain/service.js';
import type { ServiceRepository } from '../../ports/service-repository.port.js';

export class PostgresServiceRepository
  implements ServiceRepository
{
  constructor(
    private readonly database: Kysely<Database>,
  ) {}

  async save(
    service: Service,
  ): Promise<void> {
    try {
      await this.database
        .insertInto('infra.services')
        .values({
          id: service.id,
          key: service.key,
          name: service.name,
          created_at: service.createdAt,
        })
        .execute();
    } catch (error) {
      if (
        error instanceof DatabaseError &&
        error.code === '23505' &&
        error.constraint === 'services_key_unique'
      ) {
        throw new ServiceKeyAlreadyRegisteredError(
          service.key,
        );
      }

      throw error;
    }
  }

  async list(): Promise<Service[]> {
    const rows = await this.database
      .selectFrom('infra.services')
      .selectAll()
      .orderBy('key', 'asc')
      .execute();

    return rows.map((row) => ({
      id: row.id as ServiceId,
      key: row.key as ServiceKey,
      name: row.name,
      createdAt: row.created_at,
    }));
  }

  async findById(
    id: ServiceId,
  ): Promise<Service | null> {
    const row = await this.database
      .selectFrom('infra.services')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      id: row.id as ServiceId,
      key: row.key as ServiceKey,
      name: row.name,
      createdAt: row.created_at,
    };
  }
}
