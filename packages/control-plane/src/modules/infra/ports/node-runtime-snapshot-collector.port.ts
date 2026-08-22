import type {
  NodeRuntimeSnapshot,
} from '../domain/node-observed-state.js';
import type { NodeId } from '../domain/node.js';

export interface NodeRuntimeSnapshotCollector {
  collect(
    nodeId: NodeId,
  ): Promise<NodeRuntimeSnapshot>;
}
