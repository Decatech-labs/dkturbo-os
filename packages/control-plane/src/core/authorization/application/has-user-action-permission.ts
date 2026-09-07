import type {
  ActionKey,
} from '../../actions/domain/action-key.js';

import type {
  UserId,
} from '../../identity/domain/user.js';

import type {
  ResourceRef,
} from '../../resources/index.js';

import type {
  UserActionPermissionRepository,
} from '../ports/user-action-permission-repository.port.js';

export interface HasUserActionPermissionInput {
  userId:
    UserId;

  actionKey:
    ActionKey;

  target:
    ResourceRef;
}

export class HasUserActionPermission {
  constructor(
    private readonly permissions:
      UserActionPermissionRepository,
  ) {}

  execute(
    input:
      HasUserActionPermissionInput,
  ): Promise<boolean> {
    return this.permissions
      .exists(
        input.userId,
        input.actionKey,
        input.target,
      );
  }
}
