import type { NodeObservedState } from '../domain/node-observed-state.js';
import type { NodeId } from '../domain/node.js';

export interface NodeObservedStateRepository {
  save(state: NodeObservedState): Promise<void>;

  findByNodeId(
    nodeId: NodeId,
  ): Promise<NodeObservedState | null>;
}
