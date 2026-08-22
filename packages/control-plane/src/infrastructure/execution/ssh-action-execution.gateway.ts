import type {
  ActionExecutionGateway,
  ExecuteActionInput,
} from '../../core/actions/ports/action-execution-gateway.port.js';
import type {
  NodeId,
} from '../../modules/infra/domain/node.js';
import type {
  NodeAccessEndpointRepository,
} from '../../modules/infra/ports/node-access-endpoint-repository.port.js';
import {
  SshNodeOperations,
  type SshNodeEndpoint,
} from '../ssh/ssh-node-operations.js';
import type {
  ServiceInstanceId,
} from '../../modules/infra/domain/service-instance.js';
import type {
  ServiceRuntimeBindingRepository,
} from '../../modules/infra/ports/service-runtime-binding-repository.port.js';

export class SshActionExecutionGateway
  implements ActionExecutionGateway
{
  constructor(
    private readonly endpoints:
      NodeAccessEndpointRepository,

    private readonly bindings:
      ServiceRuntimeBindingRepository,

    private readonly operations:
      SshNodeOperations,
  ) {}

  async execute(
    input: ExecuteActionInput,
  ) {
    const endpoint =
      await this.endpoints.findPreferred(
        input.nodeId as NodeId,
        'ssh',
      );

    if (!endpoint) {
      throw new Error(
        `No SSH access endpoint configured for node ${input.nodeId}`,
      );
    }

    const sshEndpoint:
      SshNodeEndpoint = {
      host: endpoint.host,
      port: endpoint.port,
      username: endpoint.username,
    };

    switch (input.actionKey) {
      case 'node.system.info.read': {
        const system =
          await this.operations
            .readSystemInfo(
              sshEndpoint,
            );

        return {
          transport: 'ssh',
          endpoint:
            sshEndpoint,
          system,
        };
      }

      case 'node.runtime.snapshot.read': {
        const runtime =
          await this.operations
            .readRuntimeSnapshot(
              sshEndpoint,
            );

        return {
          transport: 'ssh',
          endpoint:
            sshEndpoint,
          runtime,
        };
      }

      case 'service.restart': {
        if (
          input.target.kind !==
          'infra.service-instance'
        ) {
          throw new Error(
            `Invalid target for service.restart: ${input.target.kind}`,
          );
        }

        const binding =
          await this.bindings
            .findByServiceInstanceId(
              input.target
                .id as ServiceInstanceId,
            );

        if (!binding) {
          throw new Error(
            `No runtime binding configured for service instance ${input.target.id}`,
          );
        }

        switch (binding.runtimeKind) {
          case 'docker': {
            await this.operations
              .restartDockerContainer(
                sshEndpoint,
                binding.resourceName,
              );

            return {
              transport: 'ssh',

              operation:
                'service.restart',

              runtimeKind:
                binding.runtimeKind,

              resourceName:
                binding.resourceName,
            };
          }

          default:
            throw new Error(
              `Unsupported service runtime: ${binding.runtimeKind}`,
            );
        }
      }

      default:
        throw new Error(
          `Unsupported SSH action: ${input.actionKey}`,
        );
    }
  }
}
