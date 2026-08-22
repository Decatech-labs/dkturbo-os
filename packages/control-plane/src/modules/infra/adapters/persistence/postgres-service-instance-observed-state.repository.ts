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
  ServiceInstanceObservedState,
  ServiceInstanceRuntimeSnapshot,
} from '../../domain/service-instance-observed-state.js';

import type {
  ServiceInstanceObservedStateRepository,
} from '../../ports/service-instance-observed-state-repository.port.js';

export class PostgresServiceInstanceObservedStateRepository
  implements ServiceInstanceObservedStateRepository
{
  constructor(
    private readonly database:
      Kysely<Database>,
  ) {}

  async save(
    state:
      ServiceInstanceObservedState,
  ): Promise<void> {
    await this.database
      .insertInto(
        'infra.service_instance_observed_state',
      )
      .values({
        service_instance_id:
          state.serviceInstanceId,

        collected_at:
          state.collectedAt,

        runtime_snapshot:
          state.runtimeSnapshot,
      })
      .onConflict((conflict) =>
        conflict
          .column(
            'service_instance_id',
          )
          .doUpdateSet({
            collected_at:
              state.collectedAt,

            runtime_snapshot:
              state.runtimeSnapshot,
          }),
      )
      .execute();
  }

  async findByServiceInstanceId(
    serviceInstanceId:
      ServiceInstanceId,
  ): Promise<
    ServiceInstanceObservedState | null
  > {
    const row =
      await this.database
        .selectFrom(
          'infra.service_instance_observed_state',
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

      collectedAt:
        row.collected_at,

      runtimeSnapshot:
        row.runtime_snapshot as ServiceInstanceRuntimeSnapshot,
    };
  }
}
