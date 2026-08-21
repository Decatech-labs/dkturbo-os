import type { Clock } from '../../time/index.js';
import {
  createUser,
  type User,
  type UserId,
} from '../domain/user.js';
import type { UserRepository } from '../ports/user-repository.port.js';

export interface BootstrapOwnerInput {
  id: string;
  name: string;
}

export class BootstrapOwner {
  constructor(
    private readonly users: UserRepository,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: BootstrapOwnerInput,
  ): Promise<User> {
    const existing =
      await this.users.findById(
        input.id as UserId,
      );

    if (existing) {
      if (existing.role !== 'owner') {
        throw new Error(
          'Bootstrap owner id belongs to a non-owner user',
        );
      }

      return existing;
    }

    const owner = createUser({
      id: input.id,
      name: input.name,
      role: 'owner',
      createdAt: this.clock.now(),
    });

    await this.users.saveIfAbsent(owner);

    return owner;
  }
}
