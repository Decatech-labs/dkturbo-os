import {
  describe,
  expect,
  it,
} from 'vitest';

import { createActorRef } from '../../actors/index.js';
import { createActionKey } from '../../actions/domain/action-key.js';
import { createResourceRef } from '../../resources/index.js';
import { DenyByDefaultActionAuthorizer } from './deny-by-default-action-authorizer.js';

describe('DenyByDefaultActionAuthorizer', () => {
  it('denies actions while no policy is configured', async () => {
    const authorizer =
      new DenyByDefaultActionAuthorizer();

    const decision =
      await authorizer.authorize({
        actor: createActorRef({
          kind: 'user',
          id: 'test-user',
        }),
        actionKey:
          createActionKey('service.restart'),
        target: createResourceRef({
          kind:
            'infra.service-instance',
          id: 'test-instance',
        }),
      });

    expect(decision).toEqual({
      outcome: 'DENY',
      reason:
        'authorization_policy_not_configured',
    });
  });
});
