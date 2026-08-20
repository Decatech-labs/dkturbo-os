import { NodeNotFoundError } from './errors/node-not-found.error.js';
import {
  createCapabilityKey,
  createNodeCapability,
  type NodeCapability,
} from '../domain/node-capability.js';
import type { NodeId } from '../domain/node.js';
import type { Clock } from '../../../core/time/index.js';
import type { NodeCapabilityRepository } from '../ports/node-capability-repository.port.js';
import type { NodeRepository } from '../ports/node-repository.port.js';

export interface RegisterNodeCapabilityInput {
  nodeId: NodeId;
  capabilityKey: string;
}

export class RegisterNodeCapability {
  constructor(
    private readonly nodes: NodeRepository,
    private readonly capabilities: NodeCapabilityRepository,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: RegisterNodeCapabilityInput,
  ): Promise<NodeCapability> {
    const node = await this.nodes.findById(
      input.nodeId,
    );

    if (!node) {
      throw new NodeNotFoundError(input.nodeId);
    }

    const key = createCapabilityKey(
      input.capabilityKey,
    );

    const capability = createNodeCapability(
      input.nodeId,
      key,
      this.clock.now(),
    );

    await this.capabilities.save(capability);

    return capability;
  }
}
