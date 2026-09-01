import type {
  UserId,
} from '../../identity/domain/user.js';

import type {
  UserRepository,
} from '../../identity/ports/user-repository.port.js';

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
      await this.users.findById(
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

    switch (
      user.role
    ) {
      case 'owner':
        return {
          outcome:
            'ALLOW',

          reason:
            'owner_role',
        };

      case 'member': {
        const permitted =
          await this.permissions
            .exists(
              user.id,
              input.actionKey,
              input.target,
            );

        if (permitted) {
          return {
            outcome:
              'ALLOW',

            reason:
              'user_action_permission',
          };
        }

        return {
          outcome:
            'APPROVAL_REQUIRED',

          reason:
            'member_requires_owner_approval',
        };
      }

      case 'guest':
        return {
          outcome:
            'DENY',

          reason:
            'guest_role',
        };
    }
  }
}