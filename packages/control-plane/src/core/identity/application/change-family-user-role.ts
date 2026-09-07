import type {
  User,
  UserId,
} from '../domain/user.js';

import type {
  UserRepository,
} from '../ports/user-repository.port.js';

export interface ChangeFamilyUserRoleInput {
  userId: UserId;
  role:
    | 'member'
    | 'guest';
}

export class ChangeFamilyUserRole {
  constructor(
    private readonly users:
      UserRepository,
  ) {}

  async execute(
    input:
      ChangeFamilyUserRoleInput,
  ): Promise<User> {
    const existing =
      await this.users.findById(
        input.userId,
      );

    if (!existing) {
      throw new Error(
        'family_user_not_found',
      );
    }

    if (
      existing.role ===
      'owner'
    ) {
      throw new Error(
        'owner_cannot_be_modified',
      );
    }

    await this.users.updateRole(
      input.userId,
      input.role,
    );

    return {
      ...existing,
      role:
        input.role,
    };
  }
}
