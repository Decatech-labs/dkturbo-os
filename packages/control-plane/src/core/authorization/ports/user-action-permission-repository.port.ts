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
  UserActionPermission,
} from '../domain/user-action-permission.js';

export interface UserActionPermissionRepository {
  save(
    permission:
      UserActionPermission,
  ): Promise<void>;

  exists(
    userId:
      UserId,

    actionKey:
      ActionKey,

    target:
      ResourceRef,
  ): Promise<boolean>;
}
