import { describe, expect, it } from 'vitest';

import type { NodeId } from './node.js';
import { evaluateNodeStatus } from './node-status.js';

const nodeId =
  '11111111-1111-4111-8111-111111111111' as NodeId;

describe('evaluateNodeStatus', () => {
  it('returns UNKNOWN when the node has never been observed', () => {
    const result = evaluateNodeStatus({
      nodeId,
      observedState: null,
      now: new Date('2026-08-20T20:01:00.000Z'),
    });

    expect(result.status).toBe('UNKNOWN');
    expect(result.lastSeenAt).toBeNull();
  });

  it('returns ONLINE when the last observation is recent', () => {
    const lastSeenAt =
      new Date('2026-08-20T20:00:30.000Z');

    const result = evaluateNodeStatus({
      nodeId,
      observedState: {
        nodeId,
        lastSeenAt,
        runtimeCollectedAt: null,
        runtimeSnapshot: null,
      },
      now: new Date('2026-08-20T20:01:00.000Z'),
    });

    expect(result.status).toBe('ONLINE');
    expect(result.lastSeenAt).toEqual(lastSeenAt);
  });

  it('returns ONLINE exactly at the freshness threshold', () => {
    const result = evaluateNodeStatus({
      nodeId,
      observedState: {
        nodeId,
        lastSeenAt:
          new Date('2026-08-20T20:00:00.000Z'),
        runtimeCollectedAt: null,
        runtimeSnapshot: null,
      },
      now: new Date('2026-08-20T20:01:00.000Z'),
    });

    expect(result.status).toBe('ONLINE');
  });

  it('returns STALE after the freshness threshold', () => {
    const result = evaluateNodeStatus({
      nodeId,
      observedState: {
        nodeId,
        lastSeenAt:
          new Date('2026-08-20T19:59:59.999Z'),
          runtimeCollectedAt: null,
          runtimeSnapshot: null,
      },
      now: new Date('2026-08-20T20:01:00.000Z'),
    });

    expect(result.status).toBe('STALE');
  });
});
