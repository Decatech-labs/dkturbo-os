import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  createDatabase,
} from '../../../../infrastructure/postgres/index.js';
import type {
  Node,
  NodeId,
} from '../../domain/node.js';
import { PostgresNodeRepository } from './postgres-node.repository.js';
import { NodeHostnameAlreadyRegisteredError } from '../../application/errors/node-hostname-already-registered.error.js';

const TEST_DATABASE_URL =
  'postgresql://dkturbo:dkturbo_test@127.0.0.1:5433/dkturbo_test';

const database = createDatabase({
  connectionString: TEST_DATABASE_URL,
});

const repository =
  new PostgresNodeRepository(database);

const testNodeIds: NodeId[] = [];

const createTestNode = (): Node => {
  const id = randomUUID() as NodeId;

  testNodeIds.push(id);

  return {
    id,
    name: `Test Node ${id}`,
    hostname: `test-${id}`,
    createdAt: new Date(),
  };
};

beforeAll(async () => {
  await database
    .deleteFrom('infra.nodes')
    .where('hostname', 'like', 'test-%')
    .execute();
});

afterAll(async () => {
  if (testNodeIds.length > 0) {
    await database
      .deleteFrom('infra.nodes')
      .where('id', 'in', testNodeIds)
      .execute();
  }

  await database.destroy();
});

describe('PostgresNodeRepository', () => {
  it('saves and finds a node by id', async () => {
    const node = createTestNode();

    await repository.save(node);

    const result =
      await repository.findById(node.id);

    expect(result).toEqual(node);
  });

  it('returns null when a node does not exist', async () => {
    const missingId =
      randomUUID() as NodeId;

    const result =
      await repository.findById(missingId);

    expect(result).toBeNull();
  });

  it('lists saved nodes', async () => {
    const node = createTestNode();

    await repository.save(node);

    const nodes = await repository.list();

    expect(
      nodes.some(
        (storedNode) =>
          storedNode.id === node.id,
      ),
    ).toBe(true);
  });

  it('translates duplicate hostname violations', async () => {
    const firstNode = createTestNode();

    const secondNode = createTestNode();

    secondNode.hostname = firstNode.hostname;

    await repository.save(firstNode);

    await expect(
      repository.save(secondNode),
    ).rejects.toBeInstanceOf(
      NodeHostnameAlreadyRegisteredError,
    );
  });
});
