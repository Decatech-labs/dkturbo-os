import type {
  Kysely,
} from 'kysely';

import type {
  Database,
} from '../../../../infrastructure/postgres/database.js';

import type {
  ServiceInstanceId,
} from '../../domain/service-instance.js';

import type {
  ServiceRuntimeBinding,
  ServiceRuntimeKind,
} from '../../domain/service-runtime-binding.js';

import type {
  ServiceRuntimeBindingRepository,
} from '../../ports/service-runtime-binding-repository.port.js';

export class PostgresServiceRuntimeBindingRepository
  implements ServiceRuntimeBindingRepository
{
  constructor(
    private readonly database:
      Kysely<Database>,
  ) {}

  async save(
    binding:
      ServiceRuntimeBinding,
  ): Promise<void> {
    await this.database
      .insertInto(
        'infra.service_runtime_bindings',
      )
      .values({
        service_instance_id:
          binding.serviceInstanceId,

        runtime_kind:
          binding.runtimeKind,

        resource_name:
          binding.resourceName,

        created_at:
          binding.createdAt,
      })
      .onConflict((conflict) =>
        conflict
          .column(
            'service_instance_id',
          )
          .doUpdateSet({
            runtime_kind:
              binding.runtimeKind,

            resource_name:
              binding.resourceName,
          }),
      )
      .execute();
  }

  async findByServiceInstanceId(
    serviceInstanceId:
      ServiceInstanceId,
  ): Promise<
    ServiceRuntimeBinding | null
  > {
    const row =
      await this.database
        .selectFrom(
          'infra.service_runtime_bindings',
        )
        .selectAll()
        .where(
          'service_instance_id',
          '=',
          serviceInstanceId,
        )
        .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      serviceInstanceId:
        row.service_instance_id as ServiceInstanceId,

      runtimeKind:
        row.runtime_kind as ServiceRuntimeKind,

      resourceName:
        row.resource_name,

      createdAt:
        row.created_at,
    };
  }

  async list(): Promise<
    ServiceRuntimeBinding[]
  > {
    const rows =
      await this.database
        .selectFrom(
          'infra.service_runtime_bindings',
        )
        .selectAll()
        .orderBy(
          'service_instance_id',
          'asc',
        )
        .execute();

    return rows.map(
      (row) => ({
        serviceInstanceId:
          row.service_instance_id as ServiceInstanceId,

        runtimeKind:
          row.runtime_kind as ServiceRuntimeKind,

        resourceName:
          row.resource_name,

        createdAt:
          row.created_at,
      }),
    );
  }
}
