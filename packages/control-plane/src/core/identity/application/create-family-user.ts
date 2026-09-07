import type {
  Clock,
} from '../../time/index.js';

import {
  createUser,
  type User,
  type UserRole,
} from '../domain/user.js';

import type {
  UserRepository,
} from '../ports/user-repository.port.js';

export interface CreateFamilyUserInput {
  id: string;
  name: string;
  role:
    | 'member'
    | 'guest';
}

export class CreateFamilyUser {
  constructor(
    private readonly users:
      UserRepository,

    private readonly clock:
      Clock,
  ) {}

  async execute(
    input: CreateFamilyUserInput,
  ): Promise<User> {
    const role:
      UserRole =
      input.role;

    const user =
      createUser({
        id:
          input.id,

        name:
          input.name,

        role,

        createdAt:
          this.clock.now(),
      });

    await this.users
      .saveIfAbsent(
        user,
      );

    return user;
  }
}
