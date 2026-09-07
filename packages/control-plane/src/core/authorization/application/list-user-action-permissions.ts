import type {
  UserId,
} from '../../identity/domain/user.js';

import type {
  UserActionPermission,
} from '../domain/user-action-permission.js';

import type {
  UserActionPermissionRepository,
} from '../ports/user-action-permission-repository.port.js';

export class ListUserActionPermissions {
  constructor(
    private readonly permissions:
      UserActionPermissionRepository,
  ) {}

  execute(
    userId:
      UserId,
  ): Promise<
    UserActionPermission[]
  > {
    return this.permissions
      .listByUser(
        userId,
      );
  }
}
