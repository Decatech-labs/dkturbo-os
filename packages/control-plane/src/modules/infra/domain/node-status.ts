import type { NodeObservedState } from './node-observed-state.js';
import type { NodeId } from './node.js';

export const NODE_ONLINE_THRESHOLD_MS =
  60_000;

export type NodeStatusValue =
  | 'UNKNOWN'
  | 'ONLINE'
  | 'STALE';

export interface NodeStatus {
  nodeId: NodeId;
  status: NodeStatusValue;
  lastSeenAt: Date | null;
  runtimeCollectedAt: Date | null;
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
      runtimeCollectedAt: null,
    };
  }

  /*
   * A heartbeat alone proves that something reported
   * activity, but it does not prove that we successfully
   * collected the Node's real runtime state.
   */
  if (
    !observedState.runtimeCollectedAt
  ) {
    return {
      nodeId,
      status: 'UNKNOWN',
      lastSeenAt:
        observedState.lastSeenAt,
      runtimeCollectedAt: null,
    };
  }

  const ageMs =
    now.getTime() -
    observedState.runtimeCollectedAt
      .getTime();

  return {
    nodeId,

    status:
      ageMs <=
      NODE_ONLINE_THRESHOLD_MS
        ? 'ONLINE'
        : 'STALE',

    lastSeenAt:
      observedState.lastSeenAt,

    runtimeCollectedAt:
      observedState.runtimeCollectedAt,
  };
};
