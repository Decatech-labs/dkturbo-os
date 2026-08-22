import type { NodeId } from './node.js';

export interface NodeRuntimeSnapshot {
  uptimeSeconds: number;

  load: {
    oneMinute: number;
    fiveMinutes: number;
    fifteenMinutes: number;
  };

  memory: {
    totalBytes: number;
    availableBytes: number;
    usedBytes: number;
    usedPercent: number;
  };

  rootFilesystem: {
    totalBytes: number;
    usedBytes: number;
    availableBytes: number;
    usedPercent: number;
  };
}

export interface NodeObservedState {
  nodeId: NodeId;

  lastSeenAt: Date;

  runtimeCollectedAt:
    Date | null;

  runtimeSnapshot:
    NodeRuntimeSnapshot | null;
}

export const observeNode = (
  nodeId: NodeId,
  observedAt: Date,
): NodeObservedState => ({
  nodeId,
  lastSeenAt: observedAt,
  runtimeCollectedAt: null,
  runtimeSnapshot: null,
});

export const observeNodeRuntime = (
  nodeId: NodeId,
  observedAt: Date,
  snapshot: NodeRuntimeSnapshot,
): NodeObservedState => ({
  nodeId,
  lastSeenAt: observedAt,
  runtimeCollectedAt: observedAt,
  runtimeSnapshot: snapshot,
});
