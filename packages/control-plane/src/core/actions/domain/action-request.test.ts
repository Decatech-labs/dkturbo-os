import {
  describe,
  expect,
  it,
} from 'vitest';

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

    const request =
      createActionRequest({
        actionKey: 'service.restart',
        target: createResourceRef({
          kind:
            'infra.service-instance',
          id: '123',
        }),
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
        requestedAt: new Date(),
      }),
    ).toThrow();
  });
});
