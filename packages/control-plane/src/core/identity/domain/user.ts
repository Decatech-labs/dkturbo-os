export type UserId = string & {
  readonly __brand: 'UserId';
};

export type UserRole =
  | 'owner'
  | 'member'
  | 'guest';

export interface User {
  id: UserId;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface CreateUserInput {
  id: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export const createUser = ({
  id,
  name,
  role,
  createdAt,
}: CreateUserInput): User => {
  const normalizedId = id.trim();
  const normalizedName = name.trim();

  if (normalizedId.length === 0) {
    throw new Error('User id cannot be empty');
  }

  if (normalizedName.length === 0) {
    throw new Error('User name cannot be empty');
  }

  return {
    id: normalizedId as UserId,
    name: normalizedName,
    role,
    createdAt,
  };
};
