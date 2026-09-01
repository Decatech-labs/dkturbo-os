import type {
  Kysely,
} from 'kysely';

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
  Database,
} from '../../../infrastructure/postgres/database.js';

import type {
  UserActionPermission,
} from '../domain/user-action-permission.js';

import type {
  UserActionPermissionRepository,
} from '../ports/user-action-permission-repository.port.js';

export class PostgresUserActionPermissionRepository
  implements
    UserActionPermissionRepository
{
  constructor(
    private readonly database:
      Kysely<Database>,
  ) {}

  async save(
    permission:
      UserActionPermission,
  ): Promise<void> {
    await this.database
      .insertInto(
        'authz.user_action_permissions',
      )
      .values({
        id:
          permission.id,

        user_id:
          permission.userId,

        action_key:
          permission.actionKey,

        target_kind:
          permission.target.kind,

        target_id:
          permission.target.id,

        granted_by_user_id:
          permission.grantedByUserId,

        granted_at:
          permission.grantedAt,
      })
      .onConflict(
        (conflict) =>
          conflict
            .columns([
              'user_id',
              'action_key',
              'target_kind',
              'target_id',
            ])
            .doNothing(),
      )
      .execute();
  }

  async exists(
    userId:
      UserId,

    actionKey:
      ActionKey,

    target:
      ResourceRef,
  ): Promise<boolean> {
    const row =
      await this.database
        .selectFrom(
          'authz.user_action_permissions',
        )
        .select('id')
        .where(
          'user_id',
          '=',
          userId,
        )
        .where(
          'action_key',
          '=',
          actionKey,
        )
        .where(
          'target_kind',
          '=',
          target.kind,
        )
        .where(
          'target_id',
          '=',
          target.id,
        )
        .executeTakeFirst();

    return row !== undefined;
  }
}
