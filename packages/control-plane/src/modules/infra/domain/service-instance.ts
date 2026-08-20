import { randomUUID } from 'node:crypto';

import type { NodeId } from './node.js';
import type { ServiceId } from './service.js';

export type ServiceInstanceId = string & {
  readonly __brand: 'ServiceInstanceId';
};

export type ServiceInstanceKey = string & {
  readonly __brand: 'ServiceInstanceKey';
};

export type Environment = string & {
  readonly __brand: 'Environment';
};

export interface ServiceInstance {
  id: ServiceInstanceId;
  key: ServiceInstanceKey;
  serviceId: ServiceId;
  nodeId: NodeId;
  environment: Environment;
  createdAt: Date;
}

const INSTANCE_KEY_PATTERN =
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

const ENVIRONMENT_PATTERN =
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export const createServiceInstanceKey = (
  value: string,
): ServiceInstanceKey => {
  const normalized = value.trim().toLowerCase();

  if (!INSTANCE_KEY_PATTERN.test(normalized)) {
    throw new Error(
      `Invalid service instance key: ${value}`,
    );
  }

  return normalized as ServiceInstanceKey;
};

export const createEnvironment = (
  value: string,
): Environment => {
  const normalized = value.trim().toLowerCase();

  if (!ENVIRONMENT_PATTERN.test(normalized)) {
    throw new Error(
      `Invalid environment: ${value}`,
    );
  }

  return normalized as Environment;
};

export interface CreateServiceInstanceInput {
  key: string;
  serviceId: ServiceId;
  nodeId: NodeId;
  environment: string;
  createdAt: Date;
}

export const createServiceInstance = ({
  key,
  serviceId,
  nodeId,
  environment,
  createdAt,
}: CreateServiceInstanceInput): ServiceInstance => ({
  id: randomUUID() as ServiceInstanceId,
  key: createServiceInstanceKey(key),
  serviceId,
  nodeId,
  environment: createEnvironment(environment),
  createdAt,
});
