import type {
  ServiceInstanceId,
} from './service-instance.js';

export type ServiceRuntimeKind =
  'docker';

export interface ServiceRuntimeBinding {
  serviceInstanceId:
    ServiceInstanceId;

  runtimeKind:
    ServiceRuntimeKind;

  resourceName: string;

  createdAt: Date;
}

const RESOURCE_NAME_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9_.-]*$/;

export const createRuntimeResourceName = (
  value: string,
): string => {
  const normalized =
    value.trim();

  if (
    !RESOURCE_NAME_PATTERN.test(
      normalized,
    )
  ) {
    throw new Error(
      `Invalid runtime resource name: ${value}`,
    );
  }

  return normalized;
};

export interface CreateServiceRuntimeBindingInput {
  serviceInstanceId:
    ServiceInstanceId;

  runtimeKind:
    ServiceRuntimeKind;

  resourceName: string;

  createdAt: Date;
}

export const createServiceRuntimeBinding = ({
  serviceInstanceId,
  runtimeKind,
  resourceName,
  createdAt,
}: CreateServiceRuntimeBindingInput): ServiceRuntimeBinding => ({
  serviceInstanceId,
  runtimeKind,
  resourceName:
    createRuntimeResourceName(
      resourceName,
    ),
  createdAt,
});
