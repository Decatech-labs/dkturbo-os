import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createActorRef,
} from '../../actors/index.js';
import {
  createResourceRef,
} from '../../resources/index.js';
import {
  createActionRequest,
} from './action-request.js';

describe('ActionRequest', () => {
  it('creates a requested action', () => {
    const requestedAt =
      new Date('2026-08-20T22:30:00.000Z');

    const requestedBy =
      createActorRef({
        kind: 'user',
        id: 'test-user',
      });

    const request =
      createActionRequest({
        actionKey: 'service.restart',
        target: createResourceRef({
          kind:
            'infra.service-instance',
          id: '123',
        }),
        requestedBy,
        parameters: {},
        requestedAt,
      });

    expect(request.id).toBeTruthy();

    expect(request.actionKey).toBe(
      'service.restart',
    );

    expect(request.target).toEqual({
      kind: 'infra.service-instance',
      id: '123',
    });

    expect(request.requestedBy).toEqual({
      kind: 'user',
      id: 'test-user',
    });

    expect(request.status).toBe(
      'REQUESTED',
    );

    expect(request.requestedAt).toEqual(
      requestedAt,
    );
  });

  it('rejects invalid action keys', () => {
    expect(() =>
      createActionRequest({
        actionKey: 'restart service',
        target: createResourceRef({
          kind: 'infra.node',
          id: '123',
        }),
        requestedBy:
          createActorRef({
            kind: 'user',
            id: 'test-user',
          }),
        requestedAt: new Date(),
      }),
    ).toThrow();
  });
});
