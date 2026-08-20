import type { Kysely } from 'kysely';
import { DatabaseError } from 'pg';

import type { Database } from '../../../../infrastructure/postgres/database.js';
import { ServiceInstanceKeyAlreadyRegisteredError } from '../../application/errors/service-instance-key-already-registered.error.js';
import type {
  Environment,
  ServiceInstance,
  ServiceInstanceId,
  ServiceInstanceKey,
} from '../../domain/service-instance.js';
import type { NodeId } from '../../domain/node.js';
import type { ServiceId } from '../../domain/service.js';
import type { ServiceInstanceRepository } from '../../ports/service-instance-repository.port.js';

export class PostgresServiceInstanceRepository
  implements ServiceInstanceRepository
{
  constructor(
    private readonly database: Kysely<Database>,
  ) {}

  async save(
    instance: ServiceInstance,
  ): Promise<void> {
    try {
      await this.database
        .insertInto('infra.service_instances')
        .values({
          id: instance.id,
          key: instance.key,
          service_id: instance.serviceId,
          node_id: instance.nodeId,
          environment: instance.environment,
          created_at: instance.createdAt,
        })
        .execute();
    } catch (error) {
      if (
        error instanceof DatabaseError &&
        error.code === '23505' &&
        error.constraint ===
          'service_instances_key_unique'
      ) {
        throw new ServiceInstanceKeyAlreadyRegisteredError(
          instance.key,
        );
      }

      throw error;
    }
  }

  async list(): Promise<ServiceInstance[]> {
    const rows = await this.database
      .selectFrom('infra.service_instances')
      .selectAll()
      .orderBy('key', 'asc')
      .execute();

    return rows.map((row) => ({
      id: row.id as ServiceInstanceId,
      key: row.key as ServiceInstanceKey,
      serviceId: row.service_id as ServiceId,
      nodeId: row.node_id as NodeId,
      environment: row.environment as Environment,
      createdAt: row.created_at,
    }));
  }
}
