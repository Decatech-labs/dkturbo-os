import type {
  SshNodeOperations,
} from '../../../infrastructure/ssh/ssh-node-operations.js';

import type {
  ServiceInstance,
} from '../domain/service-instance.js';

import type {
  ServiceInstanceRuntimeSnapshot,
} from '../domain/service-instance-observed-state.js';

import type {
  NodeAccessEndpointRepository,
} from '../ports/node-access-endpoint-repository.port.js';

import type {
  ServiceInstanceRuntimeSnapshotCollector,
} from '../ports/service-instance-runtime-snapshot-collector.port.js';

import type {
  ServiceRuntimeBindingRepository,
} from '../ports/service-runtime-binding-repository.port.js';

export class SshServiceInstanceRuntimeSnapshotCollector
  implements ServiceInstanceRuntimeSnapshotCollector
{
  constructor(
    private readonly bindings:
      ServiceRuntimeBindingRepository,

    private readonly endpoints:
      NodeAccessEndpointRepository,

    private readonly operations:
      SshNodeOperations,
  ) {}

  async collect(
    instance:
      ServiceInstance,
  ): Promise<
    ServiceInstanceRuntimeSnapshot
  > {
    const binding =
      await this.bindings
        .findByServiceInstanceId(
          instance.id,
        );

    if (!binding) {
      throw new Error(
        `No runtime binding configured for service instance ${instance.id}`,
      );
    }

    const endpoint =
      await this.endpoints
        .findPreferred(
          instance.nodeId,
          'ssh',
        );

    if (!endpoint) {
      throw new Error(
        `No SSH access endpoint configured for node ${instance.nodeId}`,
      );
    }

    switch (
      binding.runtimeKind
    ) {
      case 'docker': {
        const state =
          await this.operations
            .readDockerContainerState(
              {
                host:
                  endpoint.host,

                port:
                  endpoint.port,

                username:
                  endpoint.username,
              },

              binding.resourceName,
            );

        return {
          runtimeKind:
            'docker',

          resourceName:
            binding.resourceName,

          state,
        };
      }
    }
  }
}
