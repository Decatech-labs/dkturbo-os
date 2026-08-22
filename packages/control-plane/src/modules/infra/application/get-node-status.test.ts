import { describe, expect, it } from 'vitest';

import type { NodeObservedState } from '../domain/node-observed-state.js';
import type {
  Node,
  NodeId,
} from '../domain/node.js';
import type { Clock } from '../../../core/time/index.js';
import type { NodeObservedStateRepository } from '../ports/node-observed-state-repository.port.js';
import type { NodeRepository } from '../ports/node-repository.port.js';
import { GetNodeStatus } from './get-node-status.js';

class FakeClock implements Clock {
  constructor(
    private readonly currentTime: Date,
  ) {}

  now(): Date {
    return this.currentTime;
  }
}

class FakeNodeRepository implements NodeRepository {
  constructor(
    private readonly node: Node,
  ) {}

  async save(_node: Node): Promise<void> {}

  async list(): Promise<Node[]> {
    return [this.node];
  }

  async findById(
    id: NodeId,
  ): Promise<Node | null> {
    return id === this.node.id
      ? this.node
      : null;
  }
}

class FakeObservedStateRepository
  implements NodeObservedStateRepository
{
  constructor(
    private readonly state:
      | NodeObservedState
      | null,
  ) {}

  async save(
    _state: NodeObservedState,
  ): Promise<void> {}

  async findByNodeId(
    _nodeId: NodeId,
  ): Promise<NodeObservedState | null> {
    return this.state;
  }

  async saveRuntimeSnapshot(): Promise<void> {
    throw new Error(
      'Not implemented in this test',
    );
  }
}

describe('GetNodeStatus', () => {
  it('returns ONLINE using the injected clock', async () => {
    const node: Node = {
      id: '11111111-1111-4111-8111-111111111111' as NodeId,
      name: 'DK-NODE-HOME-01',
      hostname: 'dk-node-home-01',
      createdAt:
        new Date('2026-08-20T19:00:00.000Z'),
    };

    const clock = new FakeClock(
      new Date('2026-08-20T20:01:00.000Z'),
    );

    const nodes =
      new FakeNodeRepository(node);

    const observedState =
      new FakeObservedStateRepository({
        nodeId: node.id,

        lastSeenAt:
          new Date(
            '2026-08-20T20:00:30.000Z',
          ),

        runtimeCollectedAt: null,
        runtimeSnapshot: null,
      });

    const getNodeStatus =
      new GetNodeStatus(
        nodes,
        observedState,
        clock,
      );

    const result =
      await getNodeStatus.execute(node.id);

    expect(result.status).toBe('ONLINE');
  });
});
