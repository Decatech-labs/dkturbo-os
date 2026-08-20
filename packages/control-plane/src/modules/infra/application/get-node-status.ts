import { NodeNotFoundError } from './errors/node-not-found.error.js';
import {
  evaluateNodeStatus,
  type NodeStatus,
} from '../domain/node-status.js';
import type { NodeId } from '../domain/node.js';
import type { Clock } from '../../../core/time/index.js';
import type { NodeObservedStateRepository } from '../ports/node-observed-state-repository.port.js';
import type { NodeRepository } from '../ports/node-repository.port.js';

export class GetNodeStatus {
  constructor(
    private readonly nodes: NodeRepository,
    private readonly observedState: NodeObservedStateRepository,
    private readonly clock: Clock,
  ) {}

  async execute(
    nodeId: NodeId,
  ): Promise<NodeStatus> {
    const node = await this.nodes.findById(nodeId);

    if (!node) {
      throw new NodeNotFoundError(nodeId);
    }

    const state =
      await this.observedState.findByNodeId(nodeId);

    return evaluateNodeStatus({
      nodeId,
      observedState: state,
      now: this.clock.now(),
    });
  }
}
