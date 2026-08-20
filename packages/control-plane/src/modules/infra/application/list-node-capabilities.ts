import { NodeNotFoundError } from './errors/node-not-found.error.js';
import type { NodeCapability } from '../domain/node-capability.js';
import type { NodeId } from '../domain/node.js';
import type { NodeCapabilityRepository } from '../ports/node-capability-repository.port.js';
import type { NodeRepository } from '../ports/node-repository.port.js';

export class ListNodeCapabilities {
  constructor(
    private readonly nodes: NodeRepository,
    private readonly capabilities: NodeCapabilityRepository,
  ) {}

  async execute(
    nodeId: NodeId,
  ): Promise<NodeCapability[]> {
    const node = await this.nodes.findById(nodeId);

    if (!node) {
      throw new NodeNotFoundError(nodeId);
    }

    return this.capabilities.listByNodeId(
      nodeId,
    );
  }
}
