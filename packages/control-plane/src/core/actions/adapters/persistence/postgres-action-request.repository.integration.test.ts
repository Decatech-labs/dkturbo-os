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
  createResourceRef,
} from '../../../resources/index.js';
import {
  createActionRequest,
} from '../../domain/action-request.js';
import { PostgresActionRequestRepository } from './postgres-action-request.repository.js';

const TEST_DATABASE_URL =
  'postgresql://dkturbo:dkturbo_test@127.0.0.1:5433/dkturbo_test';

const database = createDatabase({
  connectionString: TEST_DATABASE_URL,
});

const repository =
  new PostgresActionRequestRepository(
    database,
  );

const createdIds: string[] = [];

afterAll(async () => {
  if (createdIds.length > 0) {
    await database
      .deleteFrom(
        'actions.action_requests',
      )
      .where('id', 'in', createdIds)
      .execute();
  }

  await database.destroy();
});

describe('PostgresActionRequestRepository', () => {
  it('stores and lists action requests', async () => {
    const request =
      createActionRequest({
        actionKey:
          'service.restart',
        target: createResourceRef({
          kind:
            'infra.service-instance',
          id: 'test-target',
        }),
        parameters: {
          reason: 'integration-test',
        },
        requestedAt:
          new Date(
            '2026-08-20T22:30:00.000Z',
          ),
      });

    createdIds.push(request.id);

    await repository.save(request);

    const result =
      await repository.list();

    expect(
      result.some(
        (stored) =>
          stored.id === request.id,
      ),
    ).toBe(true);

    const stored = result.find(
      (item) =>
        item.id === request.id,
    );

    expect(stored?.target).toEqual(
      request.target,
    );

    expect(stored?.parameters).toEqual(
      request.parameters,
    );

    expect(stored?.status).toBe(
      'REQUESTED',
    );
  });
});
