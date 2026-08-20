import { NodeNotFoundError } from './errors/node-not-found.error.js';
import type { NodeObservedState } from '../domain/node-observed-state.js';
import type { NodeId } from '../domain/node.js';
import type { NodeObservedStateRepository } from '../ports/node-observed-state-repository.port.js';
import type { NodeRepository } from '../ports/node-repository.port.js';

export class GetNodeObservedState {
  constructor(
    private readonly nodes: NodeRepository,
    private readonly observedState: NodeObservedStateRepository,
  ) {}

  async execute(
    nodeId: NodeId,
  ): Promise<NodeObservedState | null> {
    const node = await this.nodes.findById(nodeId);

    if (!node) {
      throw new NodeNotFoundError(nodeId);
    }

    return this.observedState.findByNodeId(nodeId);
  }
}
