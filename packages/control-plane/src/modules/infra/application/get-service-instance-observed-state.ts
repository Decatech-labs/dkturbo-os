import type {
  ServiceInstanceId,
} from '../domain/service-instance.js';

import type {
  ServiceInstanceObservedState,
} from '../domain/service-instance-observed-state.js';

import type {
  ServiceInstanceRepository,
} from '../ports/service-instance-repository.port.js';

import type {
  ServiceInstanceObservedStateRepository,
} from '../ports/service-instance-observed-state-repository.port.js';

export class GetServiceInstanceObservedState {
  constructor(
    private readonly instances:
      ServiceInstanceRepository,

    private readonly observedState:
      ServiceInstanceObservedStateRepository,
  ) {}

  async execute(
    serviceInstanceId:
      ServiceInstanceId,
  ): Promise<
    ServiceInstanceObservedState | null
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

    return this.observedState
      .findByServiceInstanceId(
        serviceInstanceId,
      );
  }
}
