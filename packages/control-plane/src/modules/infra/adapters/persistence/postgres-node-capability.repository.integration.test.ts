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
import {
  createCapabilityKey,
} from '../../domain/node-capability.js';
import type { NodeId } from '../../domain/node.js';
import { PostgresNodeCapabilityRepository } from './postgres-node-capability.repository.js';
import { PostgresNodeRepository } from './postgres-node.repository.js';

const TEST_DATABASE_URL =
  'postgresql://dkturbo:dkturbo_test@127.0.0.1:5433/dkturbo_test';

const database = createDatabase({
  connectionString: TEST_DATABASE_URL,
});

const nodes =
  new PostgresNodeRepository(database);

const capabilities =
  new PostgresNodeCapabilityRepository(database);

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

describe('PostgresNodeCapabilityRepository', () => {
  it('stores capabilities idempotently', async () => {
    const nodeId =
      randomUUID() as NodeId;

    createdNodeIds.push(nodeId);

    await nodes.save({
      id: nodeId,
      name: 'Capability Test Node',
      hostname: `capability-test-${randomUUID()}`,
      createdAt: new Date(),
    });

    const capability = {
      nodeId,
      key: createCapabilityKey('docker'),
      registeredAt:
        new Date('2026-08-20T20:00:00.000Z'),
    };

    await capabilities.save(capability);
    await capabilities.save(capability);

    const result =
      await capabilities.listByNodeId(
        nodeId,
      );

    expect(result).toHaveLength(1);
    expect(result[0]?.key).toBe('docker');
  });

  it('checks whether a capability exists', async () => {
    const nodeId =
      randomUUID() as NodeId;

    createdNodeIds.push(nodeId);

    await nodes.save({
      id: nodeId,
      name: 'Capability Exists Test Node',
      hostname: `capability-exists-${randomUUID()}`,
      createdAt: new Date(),
    });

    const docker =
      createCapabilityKey('docker');

    expect(
      await capabilities.exists(
        nodeId,
        docker,
      ),
    ).toBe(false);

    await capabilities.save({
      nodeId,
      key: docker,
      registeredAt: new Date(),
    });

    expect(
      await capabilities.exists(
        nodeId,
        docker,
      ),
    ).toBe(true);
  });
});
