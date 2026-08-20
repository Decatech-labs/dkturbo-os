import { randomUUID } from 'node:crypto';

import {
  afterAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  createDatabase,
} from '../../../../infrastructure/postgres/index.js';
import type { NodeId } from '../../domain/node.js';
import { PostgresNodeObservedStateRepository } from './postgres-node-observed-state.repository.js';
import { PostgresNodeRepository } from './postgres-node.repository.js';

const TEST_DATABASE_URL =
  'postgresql://dkturbo:dkturbo_test@127.0.0.1:5433/dkturbo_test';

const database = createDatabase({
  connectionString: TEST_DATABASE_URL,
});

const nodeRepository =
  new PostgresNodeRepository(database);

const observedStateRepository =
  new PostgresNodeObservedStateRepository(database);

const createdNodeIds: NodeId[] = [];

afterAll(async () => {
  if (createdNodeIds.length > 0) {
    await database
      .deleteFrom('infra.nodes')
      .where('id', 'in', createdNodeIds)
      .execute();
  }

  await database.destroy();
});

describe('PostgresNodeObservedStateRepository', () => {
  it('stores and updates the latest observed state', async () => {
    const nodeId = randomUUID() as NodeId;

    createdNodeIds.push(nodeId);

    await nodeRepository.save({
      id: nodeId,
      name: 'Observed State Test Node',
      hostname: `observed-test-${randomUUID()}`,
      createdAt: new Date(),
    });

    const firstObservedAt =
      new Date('2026-08-20T20:00:00.000Z');

    await observedStateRepository.save({
      nodeId,
      lastSeenAt: firstObservedAt,
    });

    const firstResult =
      await observedStateRepository.findByNodeId(nodeId);

    expect(firstResult?.lastSeenAt).toEqual(
      firstObservedAt,
    );

    const secondObservedAt =
      new Date('2026-08-20T20:01:00.000Z');

    await observedStateRepository.save({
      nodeId,
      lastSeenAt: secondObservedAt,
    });

    const secondResult =
      await observedStateRepository.findByNodeId(nodeId);

    expect(secondResult?.lastSeenAt).toEqual(
      secondObservedAt,
    );
  });
});
