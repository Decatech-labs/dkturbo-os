import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  NodeId,
} from './node.js';

import {
  evaluateNodeStatus,
} from './node-status.js';

const nodeId =
  '11111111-1111-4111-8111-111111111111' as NodeId;

describe(
  'evaluateNodeStatus',
  () => {
    it(
      'returns UNKNOWN when the node has never been observed',
      () => {
        const result =
          evaluateNodeStatus({
            nodeId,

            observedState:
              null,

            now:
              new Date(
                '2026-08-20T20:01:00.000Z',
              ),
          });

        expect(
          result.status,
        ).toBe(
          'UNKNOWN',
        );

        expect(
          result.lastSeenAt,
        ).toBeNull();

        expect(
          result.runtimeCollectedAt,
        ).toBeNull();
      },
    );

    it(
      'returns UNKNOWN when only a heartbeat exists',
      () => {
        const lastSeenAt =
          new Date(
            '2026-08-20T20:00:30.000Z',
          );

        const result =
          evaluateNodeStatus({
            nodeId,

            observedState: {
              nodeId,
              lastSeenAt,
              runtimeCollectedAt:
                null,
              runtimeSnapshot:
                null,
            },

            now:
              new Date(
                '2026-08-20T20:01:00.000Z',
              ),
          });

        expect(
          result.status,
        ).toBe(
          'UNKNOWN',
        );

        expect(
          result.lastSeenAt,
        ).toEqual(
          lastSeenAt,
        );

        expect(
          result.runtimeCollectedAt,
        ).toBeNull();
      },
    );

    it(
      'returns ONLINE when the runtime observation is recent',
      () => {
        const observedAt =
          new Date(
            '2026-08-20T20:00:30.000Z',
          );

        const result =
          evaluateNodeStatus({
            nodeId,

            observedState: {
              nodeId,

              lastSeenAt:
                observedAt,

              runtimeCollectedAt:
                observedAt,

              runtimeSnapshot:
                null,
            },

            now:
              new Date(
                '2026-08-20T20:01:00.000Z',
              ),
          });

        expect(
          result.status,
        ).toBe(
          'ONLINE',
        );

        expect(
          result.lastSeenAt,
        ).toEqual(
          observedAt,
        );

        expect(
          result.runtimeCollectedAt,
        ).toEqual(
          observedAt,
        );
      },
    );

    it(
      'returns ONLINE exactly at the freshness threshold',
      () => {
        const observedAt =
          new Date(
            '2026-08-20T20:00:00.000Z',
          );

        const result =
          evaluateNodeStatus({
            nodeId,

            observedState: {
              nodeId,

              lastSeenAt:
                observedAt,

              runtimeCollectedAt:
                observedAt,

              runtimeSnapshot:
                null,
            },

            now:
              new Date(
                '2026-08-20T20:01:00.000Z',
              ),
          });

        expect(
          result.status,
        ).toBe(
          'ONLINE',
        );
      },
    );

    it(
      'returns STALE after the freshness threshold',
      () => {
        const observedAt =
          new Date(
            '2026-08-20T19:59:59.999Z',
          );

        const result =
          evaluateNodeStatus({
            nodeId,

            observedState: {
              nodeId,

              lastSeenAt:
                observedAt,

              runtimeCollectedAt:
                observedAt,

              runtimeSnapshot:
                null,
            },

            now:
              new Date(
                '2026-08-20T20:01:00.000Z',
              ),
          });

        expect(
          result.status,
        ).toBe(
          'STALE',
        );
      },
    );
  },
);
