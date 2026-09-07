import {
  createActionKey,
} from '../../actions/domain/action-key.js';

import type {
  UserId,
} from '../../identity/domain/user.js';

import type {
  UserRepository,
} from '../../identity/ports/user-repository.port.js';

import {
  createResourceRef,
} from '../../resources/index.js';

import type {
  AuthorizationDecision,
} from '../domain/authorization-decision.js';

import type {
  ActionAuthorizer,
  AuthorizeActionInput,
} from '../ports/action-authorizer.port.js';

import type {
  UserActionPermissionRepository,
} from '../ports/user-action-permission-repository.port.js';

export class RoleBasedActionAuthorizer
  implements ActionAuthorizer
{
  constructor(
    private readonly users:
      UserRepository,

    private readonly permissions:
      UserActionPermissionRepository,
  ) {}

  async authorize(
    input:
      AuthorizeActionInput,
  ): Promise<
    AuthorizationDecision
  > {
    if (
      input.actor.kind !==
      'user'
    ) {
      return {
        outcome:
          'DENY',

        reason:
          'unsupported_actor_kind',
      };
    }

    const user =
      await this.users
        .findById(
          input.actor.id as
            UserId,
        );

    if (!user) {
      return {
        outcome:
          'DENY',

        reason:
          'unknown_actor',
      };
    }

    if (
      user.role ===
      'owner'
    ) {
      return {
        outcome:
          'ALLOW',

        reason:
          'owner_role',
      };
    }

    const exactPermission =
      await this.permissions
        .exists(
          user.id,
          input.actionKey,
          input.target,
        );

    if (
      exactPermission
    ) {
      return {
        outcome:
          'ALLOW',

        reason:
          'user_action_permission',
      };
    }

    /*
     * Capability global de Sistema:
     *
     * si el owner permite "Reiniciar servicios",
     * no obligamos a conceder cada UUID de
     * service-instance individualmente.
     */
    if (
      input.actionKey ===
      createActionKey(
        'service.restart',
      )
    ) {
      const globalRestartPermission =
        await this.permissions
          .exists(
            user.id,

            createActionKey(
              'system.services.restart',
            ),

            createResourceRef({
              kind:
                'app',

              id:
                'system',
            }),
          );

      if (
        globalRestartPermission
      ) {
        return {
          outcome:
            'ALLOW',

          reason:
            'user_action_permission',
        };
      }
    }

    return {
      outcome:
        'DENY',

      reason:
        'explicit_permission_required',
    };
  }
}
