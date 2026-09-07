import {
  createActionKey,
} from '../../actions/domain/action-key.js';

import type {
  UserId,
} from '../../identity/domain/user.js';

import {
  createResourceRef,
} from '../../resources/index.js';

import type {
  Clock,
} from '../../time/index.js';

import {
  createUserActionPermission,
  type UserActionPermission,
} from '../domain/user-action-permission.js';

import type {
  UserActionPermissionRepository,
} from '../ports/user-action-permission-repository.port.js';

export interface GrantUserActionPermissionInput {
  userId:
    UserId;

  actionKey:
    string;

  target: {
    kind:
      string;

    id:
      string;
  };

  grantedByUserId:
    UserId;
}

export class GrantUserActionPermission {
  constructor(
    private readonly permissions:
      UserActionPermissionRepository,

    private readonly clock:
      Clock,
  ) {}

  async execute(
    input:
      GrantUserActionPermissionInput,
  ): Promise<UserActionPermission> {
    const permission =
      createUserActionPermission({
        userId:
          input.userId,

        actionKey:
          createActionKey(
            input.actionKey,
          ),

        target:
          createResourceRef(
            input.target,
          ),

        grantedByUserId:
          input.grantedByUserId,

        grantedAt:
          this.clock.now(),
      });

    await this.permissions
      .save(
        permission,
      );

    return permission;
  }
}
