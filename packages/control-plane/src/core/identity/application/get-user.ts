import type {
  User,
  UserId,
} from '../domain/user.js';

import type {
  UserRepository,
} from '../ports/user-repository.port.js';

export class GetUser {
  constructor(
    private readonly users:
      UserRepository,
  ) {}

  async execute(
    id: UserId,
  ): Promise<User | null> {
    return this.users.findById(id);
  }
}
