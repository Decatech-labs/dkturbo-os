import {
  describe,
  expect,
  it,
} from 'vitest';

import type { NodeId } from './node.js';
import type {
  ServiceInstanceId,
} from './service-instance.js';
import type { ServiceId } from './service.js';
import {
  nodeResourceRef,
  serviceInstanceResourceRef,
  serviceResourceRef,
} from './resource-refs.js';

describe('Infra ResourceRefs', () => {
  it('creates node references', () => {
    const id =
      '11111111-1111-4111-8111-111111111111' as NodeId;

    expect(
      nodeResourceRef(id),
    ).toEqual({
      kind: 'infra.node',
      id,
    });
  });

  it('creates service references', () => {
    const id =
      '22222222-2222-4222-8222-222222222222' as ServiceId;

    expect(
      serviceResourceRef(id),
    ).toEqual({
      kind: 'infra.service',
      id,
    });
  });

  it('creates service instance references', () => {
    const id =
      '33333333-3333-4333-8333-333333333333' as ServiceInstanceId;

    expect(
      serviceInstanceResourceRef(id),
    ).toEqual({
      kind: 'infra.service-instance',
      id,
    });
  });
});
