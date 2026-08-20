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
import { ServiceInstanceKeyAlreadyRegisteredError } from '../../application/errors/service-instance-key-already-registered.error.js';
import {
  createServiceInstance,
} from '../../domain/service-instance.js';
import {
  createService,
} from '../../domain/service.js';
import type { NodeId } from '../../domain/node.js';
import { PostgresNodeRepository } from './postgres-node.repository.js';
import { PostgresServiceInstanceRepository } from './postgres-service-instance.repository.js';
import { PostgresServiceRepository } from './postgres-service.repository.js';

const TEST_DATABASE_URL =
  'postgresql://dkturbo:dkturbo_test@127.0.0.1:5433/dkturbo_test';

const database = createDatabase({
  connectionString: TEST_DATABASE_URL,
});

const nodes =
  new PostgresNodeRepository(database);

const services =
  new PostgresServiceRepository(database);

const instances =
  new PostgresServiceInstanceRepository(
    database,
  );

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

describe('PostgresServiceInstanceRepository', () => {
  it('stores and lists service instances', async () => {
    const nodeId =
      randomUUID() as NodeId;

    createdNodeIds.push(nodeId);

    await nodes.save({
      id: nodeId,
      name: 'Service Instance Test Node',
      hostname:
        `instance-node-${randomUUID()}`,
      createdAt: new Date(),
    });

    const service = createService({
      key: `test-${randomUUID()}`,
      name: 'Instance Test Service',
      createdAt: new Date(),
    });

    await services.save(service);

    const instance =
      createServiceInstance({
        key:
          `instance-${randomUUID()}`,
        serviceId: service.id,
        nodeId,
        environment: 'test',
        createdAt: new Date(),
      });

    await instances.save(instance);

    const result =
      await instances.list();

    expect(
      result.some(
        (stored) =>
          stored.id === instance.id,
      ),
    ).toBe(true);
  });

  it('translates duplicate instance keys', async () => {
    const nodeId =
      randomUUID() as NodeId;

    createdNodeIds.push(nodeId);

    await nodes.save({
      id: nodeId,
      name: 'Duplicate Instance Node',
      hostname:
        `duplicate-instance-${randomUUID()}`,
      createdAt: new Date(),
    });

    const service = createService({
      key: `test-${randomUUID()}`,
      name: 'Duplicate Instance Service',
      createdAt: new Date(),
    });

    await services.save(service);

    const key =
      `instance-${randomUUID()}`;

    const first =
      createServiceInstance({
        key,
        serviceId: service.id,
        nodeId,
        environment: 'test',
        createdAt: new Date(),
      });

    const second =
      createServiceInstance({
        key,
        serviceId: service.id,
        nodeId,
        environment: 'test',
        createdAt: new Date(),
      });

    await instances.save(first);

    await expect(
      instances.save(second),
    ).rejects.toBeInstanceOf(
      ServiceInstanceKeyAlreadyRegisteredError,
    );
  });
});
