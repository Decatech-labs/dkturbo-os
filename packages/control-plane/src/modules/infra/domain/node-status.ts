import type { NodeObservedState } from './node-observed-state.js';
import type { NodeId } from './node.js';

export const NODE_ONLINE_THRESHOLD_MS = 60_000;

export type NodeStatusValue =
  | 'UNKNOWN'
  | 'ONLINE'
  | 'STALE';

export interface NodeStatus {
  nodeId: NodeId;
  status: NodeStatusValue;
  lastSeenAt: Date | null;
}

export interface EvaluateNodeStatusInput {
  nodeId: NodeId;
  observedState: NodeObservedState | null;
  now: Date;
}

export const evaluateNodeStatus = ({
  nodeId,
  observedState,
  now,
}: EvaluateNodeStatusInput): NodeStatus => {
  if (!observedState) {
    return {
      nodeId,
      status: 'UNKNOWN',
      lastSeenAt: null,
    };
  }

  const ageMs =
    now.getTime() -
    observedState.lastSeenAt.getTime();

  const status: NodeStatusValue =
    ageMs <= NODE_ONLINE_THRESHOLD_MS
      ? 'ONLINE'
      : 'STALE';

  return {
    nodeId,
    status,
    lastSeenAt: observedState.lastSeenAt,
  };
};
