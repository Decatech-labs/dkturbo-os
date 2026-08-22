import type {
  ServiceInstanceId,
} from './service-instance.js';

import type {
  ServiceRuntimeKind,
} from './service-runtime-binding.js';

export type ServiceRuntimeState =
  | 'RUNNING'
  | 'STOPPED'
  | 'MISSING';

export interface ServiceInstanceRuntimeSnapshot {
  runtimeKind:
    ServiceRuntimeKind;

  resourceName: string;

  state:
    ServiceRuntimeState;
}

export interface ServiceInstanceObservedState {
  serviceInstanceId:
    ServiceInstanceId;

  collectedAt: Date;

  runtimeSnapshot:
    ServiceInstanceRuntimeSnapshot;
}

export const observeServiceInstanceRuntime = (
  serviceInstanceId:
    ServiceInstanceId,

  collectedAt: Date,

  runtimeSnapshot:
    ServiceInstanceRuntimeSnapshot,
): ServiceInstanceObservedState => ({
  serviceInstanceId,
  collectedAt,
  runtimeSnapshot,
});
