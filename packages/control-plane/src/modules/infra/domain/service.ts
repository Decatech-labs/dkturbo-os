import { randomUUID } from 'node:crypto';

export type ServiceId = string & {
  readonly __brand: 'ServiceId';
};

export type ServiceKey = string & {
  readonly __brand: 'ServiceKey';
};

export interface Service {
  id: ServiceId;
  key: ServiceKey;
  name: string;
  createdAt: Date;
}

const SERVICE_KEY_PATTERN =
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export const createServiceKey = (
  value: string,
): ServiceKey => {
  const normalized = value.trim().toLowerCase();

  if (!SERVICE_KEY_PATTERN.test(normalized)) {
    throw new Error(
      `Invalid service key: ${value}`,
    );
  }

  return normalized as ServiceKey;
};

export interface CreateServiceInput {
  key: string;
  name: string;
  createdAt: Date;
}

export const createService = ({
  key,
  name,
  createdAt,
}: CreateServiceInput): Service => {
  const normalizedName = name.trim();

  if (normalizedName.length === 0) {
    throw new Error(
      'Service name cannot be empty',
    );
  }

  return {
    id: randomUUID() as ServiceId,
    key: createServiceKey(key),
    name: normalizedName,
    createdAt,
  };
};
