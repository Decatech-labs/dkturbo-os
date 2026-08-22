import type {
  Clock,
} from '../../../core/time/index.js';

import type {
  NodeObservedState,
} from '../domain/node-observed-state.js';
import type {
  NodeId,
} from '../domain/node.js';
import type {
  NodeObservedStateRepository,
} from '../ports/node-observed-state-repository.port.js';
import type {
  NodeRepository,
} from '../ports/node-repository.port.js';
import type {
  NodeRuntimeSnapshotCollector,
} from '../ports/node-runtime-snapshot-collector.port.js';

import {
  NodeNotFoundError,
} from './errors/node-not-found.error.js';

export class RefreshNodeObservedState {
  constructor(
    private readonly nodes:
      NodeRepository,

    private readonly observedState:
      NodeObservedStateRepository,

    private readonly runtime:
      NodeRuntimeSnapshotCollector,

    private readonly clock:
      Clock,
  ) {}

  async execute(
    nodeId: NodeId,
  ): Promise<NodeObservedState> {
    const node =
      await this.nodes.findById(
        nodeId,
      );

    if (!node) {
      throw new NodeNotFoundError(
        nodeId,
      );
    }

    const snapshot =
      await this.runtime.collect(
        nodeId,
      );

    const observedAt =
      this.clock.now();

    await this.observedState
      .saveRuntimeSnapshot(
        nodeId,
        observedAt,
        snapshot,
      );

    const state =
      await this.observedState
        .findByNodeId(
          nodeId,
        );

    if (!state) {
      throw new Error(
        `Observed state disappeared for node ${nodeId}`,
      );
    }

    return state;
  }
}
