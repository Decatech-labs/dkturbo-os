import type {
  NodeObservedState,
  NodeRuntimeSnapshot,
} from '../domain/node-observed-state.js';
import type { NodeId } from '../domain/node.js';

export interface NodeObservedStateRepository {
  save(
    state: NodeObservedState,
  ): Promise<void>;

  saveRuntimeSnapshot(
    nodeId: NodeId,
    observedAt: Date,
    snapshot: NodeRuntimeSnapshot,
  ): Promise<void>;

  findByNodeId(
    nodeId: NodeId,
  ): Promise<NodeObservedState | null>;
}
