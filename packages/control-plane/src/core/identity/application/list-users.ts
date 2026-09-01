import type {
  User,
} from '../domain/user.js';

import type {
  UserRepository,
} from '../ports/user-repository.port.js';

export class ListUsers {
  constructor(
    private readonly users:
      UserRepository,
  ) {}

  async execute(): Promise<
    User[]
  > {
    return this.users.list();
  }
}
