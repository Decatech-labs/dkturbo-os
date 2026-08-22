import type {
  Clock,
} from '../../../core/time/index.js';

import type {
  ServiceInstanceId,
} from '../domain/service-instance.js';

import {
  observeServiceInstanceRuntime,
  type ServiceInstanceObservedState,
} from '../domain/service-instance-observed-state.js';

import type {
  ServiceInstanceRepository,
} from '../ports/service-instance-repository.port.js';

import type {
  ServiceInstanceObservedStateRepository,
} from '../ports/service-instance-observed-state-repository.port.js';

import type {
  ServiceInstanceRuntimeSnapshotCollector,
} from '../ports/service-instance-runtime-snapshot-collector.port.js';

export class RefreshServiceInstanceObservedState {
  constructor(
    private readonly instances:
      ServiceInstanceRepository,

    private readonly observedState:
      ServiceInstanceObservedStateRepository,

    private readonly runtime:
      ServiceInstanceRuntimeSnapshotCollector,

    private readonly clock:
      Clock,
  ) {}

  async execute(
    serviceInstanceId:
      ServiceInstanceId,
  ): Promise<
    ServiceInstanceObservedState
  > {
    const instance =
      await this.instances
        .findById(
          serviceInstanceId,
        );

    if (!instance) {
      throw new Error(
        `Service instance not found: ${serviceInstanceId}`,
      );
    }

    const snapshot =
      await this.runtime.collect(
        instance,
      );

    const observedAt =
      this.clock.now();

    const state =
      observeServiceInstanceRuntime(
        serviceInstanceId,
        observedAt,
        snapshot,
      );

    await this.observedState.save(
      state,
    );

    return state;
  }
}
