import {
  describe,
  expect,
  it,
} from 'vitest';

import { createActorRef } from '../../actors/index.js';
import { createActionKey } from '../../actions/domain/action-key.js';
import {
  createUser,
  type User,
  type UserId,
} from '../../identity/domain/user.js';
import type { UserRepository } from '../../identity/ports/user-repository.port.js';
import { createResourceRef } from '../../resources/index.js';
import { RoleBasedActionAuthorizer } from './role-based-action-authorizer.js';
import type {
  ActionKey,
} from '../../actions/domain/action-key.js';
import type {
  ResourceRef,
} from '../../resources/index.js';
import type {
  UserActionPermission,
} from '../domain/user-action-permission.js';
import type {
  UserActionPermissionRepository,
} from '../ports/user-action-permission-repository.port.js';

class FakeUserRepository
  implements UserRepository
{
  constructor(
    private readonly users: User[],
  ) {}

  async saveIfAbsent(
    _user: User,
  ): Promise<void> {}

  async findById(
    id: UserId,
  ): Promise<User | null> {
    return (
      this.users.find(
        (user) => user.id === id,
      ) ?? null
    );
  }

  async list(): Promise<User[]> {
    return this.users;
  }
}

const target = createResourceRef({
  kind: 'infra.service-instance',
  id: 'test-instance',
});

const actionKey =
  createActionKey('service.restart');

const authorizeAs = async (
  role: 'owner' | 'member' | 'guest',
) => {
  const user = createUser({
    id: `${role}-user`,
    name: role,
    role,
    createdAt: new Date(),
  });

  const authorizer = new RoleBasedActionAuthorizer(
    new FakeUserRepository([
      user,
    ]),
    new FakePermissionRepository(),
  )

  return authorizer.authorize({
    actor: createActorRef({
      kind: 'user',
      id: user.id,
    }),
    actionKey,
    target,
  });
};

describe('RoleBasedActionAuthorizer', () => {
  it('allows the owner', async () => {
    expect(
      (await authorizeAs('owner')).outcome,
    ).toBe('ALLOW');
  });

  it('requires approval for members', async () => {
    expect(
      (await authorizeAs('member')).outcome,
    ).toBe('APPROVAL_REQUIRED');
  });

  it('denies guests', async () => {
    expect(
      (await authorizeAs('guest')).outcome,
    ).toBe('DENY');
  });

  it( 'allows a member with an exact durable permission', async () => {
      const user =
        createUser({
          id:
            'permitted-member',

          name:
            'Permitted member',

          role:
            'member',

          createdAt:
            new Date(),
        });

      const authorizer =
        new RoleBasedActionAuthorizer(
          new FakeUserRepository([
            user,
          ]),
          new FakePermissionRepository(
            true,
          ),
        );

      const decision =
        await authorizer.authorize({
          actor:
            createActorRef({
              kind:
                'user',

              id:
                user.id,
            }),

          actionKey,

          target,
        });

      expect(
        decision,
      ).toEqual({
        outcome:
          'ALLOW',

        reason:
          'user_action_permission',
      });
    },
  );
});

class FakePermissionRepository
  implements
    UserActionPermissionRepository
{
  constructor(
    private readonly permitted =
      false,
  ) {}

  async save(
    _permission:
      UserActionPermission,
  ): Promise<void> {}

  async exists(
    _userId:
      UserId,
    _actionKey:
      ActionKey,
    _target:
      ResourceRef,
  ): Promise<boolean> {
    return this.permitted;
  }
}