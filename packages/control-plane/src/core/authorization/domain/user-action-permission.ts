import {
  randomUUID,
} from 'node:crypto';

import type {
  ActionKey,
} from '../../actions/domain/action-key.js';

import type {
  UserId,
} from '../../identity/domain/user.js';

import type {
  ResourceRef,
} from '../../resources/index.js';

export type UserActionPermissionId =
  string & {
    readonly __brand:
      'UserActionPermissionId';
  };

export interface UserActionPermission {
  id:
    UserActionPermissionId;

  userId:
    UserId;

  actionKey:
    ActionKey;

  target:
    ResourceRef;

  grantedByUserId:
    UserId;

  grantedAt:
    Date;
}

export interface CreateUserActionPermissionInput {
  userId:
    UserId;

  actionKey:
    ActionKey;

  target:
    ResourceRef;

  grantedByUserId:
    UserId;

  grantedAt:
    Date;
}

export const createUserActionPermission = ({
  userId,
  actionKey,
  target,
  grantedByUserId,
  grantedAt,
}: CreateUserActionPermissionInput):
  UserActionPermission => ({
  id:
    randomUUID() as
      UserActionPermissionId,

  userId,

  actionKey,

  target,

  grantedByUserId,

  grantedAt,
});
