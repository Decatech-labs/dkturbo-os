import { NodeNotFoundError } from './errors/node-not-found.error.js';
import { observeNode, type NodeObservedState } from '../domain/node-observed-state.js';
import type { NodeId } from '../domain/node.js';
import type { NodeObservedStateRepository } from '../ports/node-observed-state-repository.port.js';
import type { NodeRepository } from '../ports/node-repository.port.js';

export class RecordNodeHeartbeat {
  constructor(
    private readonly nodes: NodeRepository,
    private readonly observedState: NodeObservedStateRepository,
  ) {}

  async execute(
    nodeId: NodeId,
  ): Promise<NodeObservedState> {
    const node = await this.nodes.findById(nodeId);

    if (!node) {
      throw new NodeNotFoundError(nodeId);
    }

    const state = observeNode(
      nodeId,
      new Date(),
    );

    await this.observedState.save(state);

    return state;
  }
}
