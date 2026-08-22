import type {
  ServiceInstance,
} from '../domain/service-instance.js';

import type {
  ServiceInstanceRuntimeSnapshot,
} from '../domain/service-instance-observed-state.js';

export interface ServiceInstanceRuntimeSnapshotCollector {
  collect(
    instance:
      ServiceInstance,
  ): Promise<
    ServiceInstanceRuntimeSnapshot
  >;
}
