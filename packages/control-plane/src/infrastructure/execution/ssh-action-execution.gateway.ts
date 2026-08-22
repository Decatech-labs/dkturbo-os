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

export class SshActionExecutionGateway
  implements ActionExecutionGateway
{
  constructor(
    private readonly endpoints:
      NodeAccessEndpointRepository,

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

      default:
        throw new Error(
          `Unsupported SSH action: ${input.actionKey}`,
        );
    }
  }
}
