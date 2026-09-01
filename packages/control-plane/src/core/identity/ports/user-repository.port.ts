import type {
  User,
  UserId,
} from '../domain/user.js';

export interface UserRepository {
  saveIfAbsent(
    user: User,
  ): Promise<void>;

  findById(
    id: UserId,
  ): Promise<User | null>;

  list(): Promise<User[]>;
}