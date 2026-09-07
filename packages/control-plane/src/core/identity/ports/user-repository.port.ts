import type {
  User,
  UserId,
  UserRole,
} from '../domain/user.js';

export interface UserRepository {
  saveIfAbsent(
    user: User,
  ): Promise<void>;

  findById(
    id: UserId,
  ): Promise<User | null>;

  list(): Promise<User[]>;

  updateRole(
    id: UserId,
    role: UserRole,
  ): Promise<boolean>;

  deleteById(
    id: UserId,
  ): Promise<boolean>;
}
