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

  const authorizer =
    new RoleBasedActionAuthorizer(
      new FakeUserRepository([user]),
    );

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
});
