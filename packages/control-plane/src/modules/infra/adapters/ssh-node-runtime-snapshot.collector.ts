import {
  SshNodeOperations,
} from '../../../infrastructure/ssh/ssh-node-operations.js';

import type {
  NodeAccessEndpointRepository,
} from '../ports/node-access-endpoint-repository.port.js';
import type {
  NodeRuntimeSnapshotCollector,
} from '../ports/node-runtime-snapshot-collector.port.js';
import type {
  NodeId,
} from '../domain/node.js';

export class SshNodeRuntimeSnapshotCollector
  implements NodeRuntimeSnapshotCollector
{
  constructor(
    private readonly endpoints:
      NodeAccessEndpointRepository,

    private readonly operations:
      SshNodeOperations,
  ) {}

  async collect(
    nodeId: NodeId,
  ) {
    const endpoint =
      await this.endpoints.findPreferred(
        nodeId,
        'ssh',
      );

    if (!endpoint) {
      throw new Error(
        `No SSH access endpoint configured for node ${nodeId}`,
      );
    }

    return this.operations
      .readRuntimeSnapshot({
        host: endpoint.host,
        port: endpoint.port,
        username:
          endpoint.username,
      });
  }
}
