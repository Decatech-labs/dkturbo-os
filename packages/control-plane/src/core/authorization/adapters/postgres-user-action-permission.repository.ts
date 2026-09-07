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
  UserActionPermissionId,
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

  async listByUser(
    userId:
      UserId,
  ): Promise<
    UserActionPermission[]
  > {
    const rows =
      await this.database
        .selectFrom(
          'authz.user_action_permissions',
        )
        .selectAll()
        .where(
          'user_id',
          '=',
          userId,
        )
        .orderBy(
          'granted_at',
          'asc',
        )
        .execute();

    return rows.map(
      (row) => ({
        id:
          row.id as
            UserActionPermissionId,

        userId:
          row.user_id as
            UserId,

        actionKey:
          row.action_key as
            ActionKey,

        target: {
          kind:
            row.target_kind as
              ResourceRef['kind'],

          id:
            row.target_id,
        },

        grantedByUserId:
          row.granted_by_user_id as
            UserId,

        grantedAt:
          row.granted_at,
      }),
    );
  }

  async deleteForUser(
    id:
      UserActionPermissionId,

    userId:
      UserId,
  ): Promise<boolean> {
    const result =
      await this.database
        .deleteFrom(
          'authz.user_action_permissions',
        )
        .where(
          'id',
          '=',
          id,
        )
        .where(
          'user_id',
          '=',
          userId,
        )
        .executeTakeFirst();

    return (
      Number(
        result.numDeletedRows,
      ) >
      0
    );
  }
}
