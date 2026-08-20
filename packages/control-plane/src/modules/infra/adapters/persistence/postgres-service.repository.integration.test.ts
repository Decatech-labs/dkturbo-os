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
import { ServiceKeyAlreadyRegisteredError } from '../../application/errors/service-key-already-registered.error.js';
import {
  createService,
} from '../../domain/service.js';
import { PostgresServiceRepository } from './postgres-service.repository.js';

const TEST_DATABASE_URL =
  'postgresql://dkturbo:dkturbo_test@127.0.0.1:5433/dkturbo_test';

const database = createDatabase({
  connectionString: TEST_DATABASE_URL,
});

const services =
  new PostgresServiceRepository(database);

const createdServiceKeys: string[] = [];

afterAll(async () => {
  if (createdServiceKeys.length > 0) {
    await database
      .deleteFrom('infra.services')
      .where(
        'key',
        'in',
        createdServiceKeys,
      )
      .execute();
  }

  await database.destroy();
});

describe('PostgresServiceRepository', () => {
  it('stores and lists services', async () => {
    const key =
      `test-${randomUUID()}`;

    createdServiceKeys.push(key);

    const service = createService({
      key,
      name: 'Test Service',
      createdAt:
        new Date('2026-08-20T20:00:00.000Z'),
    });

    await services.save(service);

    const result = await services.list();

    expect(
      result.some(
        (stored) =>
          stored.id === service.id,
      ),
    ).toBe(true);
  });

  it('translates duplicate service keys', async () => {
    const key =
      `test-${randomUUID()}`;

    createdServiceKeys.push(key);

    const first = createService({
      key,
      name: 'First Service',
      createdAt: new Date(),
    });

    const second = createService({
      key,
      name: 'Second Service',
      createdAt: new Date(),
    });

    await services.save(first);

    await expect(
      services.save(second),
    ).rejects.toBeInstanceOf(
      ServiceKeyAlreadyRegisteredError,
    );
  });
});
