import type {
  UserId,
} from '../domain/user.js';

import type {
  UserRepository,
} from '../ports/user-repository.port.js';

export class DeleteFamilyUser {
  constructor(
    private readonly users:
      UserRepository,
  ) {}

  async execute(
    userId:
      UserId,
  ): Promise<void> {
    const existing =
      await this.users.findById(
        userId,
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
        'owner_cannot_be_deleted',
      );
    }

    await this.users.deleteById(
      userId,
    );
  }
}
