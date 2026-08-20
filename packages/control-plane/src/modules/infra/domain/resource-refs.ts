import {
  createResourceRef,
  type ResourceRef,
} from '../../../core/resources/index.js';

import type { NodeId } from './node.js';
import type {
  ServiceInstanceId,
} from './service-instance.js';
import type { ServiceId } from './service.js';

export const nodeResourceRef = (
  id: NodeId,
): ResourceRef => {
  return createResourceRef({
    kind: 'infra.node',
    id,
  });
};

export const serviceResourceRef = (
  id: ServiceId,
): ResourceRef => {
  return createResourceRef({
    kind: 'infra.service',
    id,
  });
};

export const serviceInstanceResourceRef = (
  id: ServiceInstanceId,
): ResourceRef => {
  return createResourceRef({
    kind: 'infra.service-instance',
    id,
  });
};
