import type {
  ServiceInstanceId,
} from '../domain/service-instance.js';

import type {
  ServiceInstanceObservedState,
} from '../domain/service-instance-observed-state.js';

export interface ServiceInstanceObservedStateRepository {
  save(
    state:
      ServiceInstanceObservedState,
  ): Promise<void>;

  findByServiceInstanceId(
    serviceInstanceId:
      ServiceInstanceId,
  ): Promise<
    ServiceInstanceObservedState | null
  >;
}
