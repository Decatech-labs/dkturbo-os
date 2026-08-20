import type { NodeId } from './node.js';

export interface NodeObservedState {
  nodeId: NodeId;
  lastSeenAt: Date;
}

export const observeNode = (
  nodeId: NodeId,
  observedAt: Date,
): NodeObservedState => {
  return {
    nodeId,
    lastSeenAt: observedAt,
  };
};
