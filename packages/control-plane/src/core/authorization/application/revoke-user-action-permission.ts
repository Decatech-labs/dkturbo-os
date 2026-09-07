import type {
  UserId,
} from '../../identity/domain/user.js';

import type {
  UserActionPermissionId,
} from '../domain/user-action-permission.js';

import type {
  UserActionPermissionRepository,
} from '../ports/user-action-permission-repository.port.js';

export interface RevokeUserActionPermissionInput {
  permissionId:
    UserActionPermissionId;

  userId:
    UserId;
}

export class RevokeUserActionPermission {
  constructor(
    private readonly permissions:
      UserActionPermissionRepository,
  ) {}

  async execute(
    input:
      RevokeUserActionPermissionInput,
  ): Promise<boolean> {
    return this.permissions
      .deleteForUser(
        input.permissionId,
        input.userId,
      );
  }
}