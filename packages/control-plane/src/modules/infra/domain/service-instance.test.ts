import { describe, expect, it } from 'vitest';

import type { NodeId } from './node.js';
import type { ServiceId } from './service.js';
import {
  createEnvironment,
  createServiceInstance,
  createServiceInstanceKey,
} from './service-instance.js';

const serviceId =
  '11111111-1111-4111-8111-111111111111' as ServiceId;

const nodeId =
  '22222222-2222-4222-8222-222222222222' as NodeId;

describe('ServiceInstance', () => {
  it('creates a valid service instance', () => {
    const createdAt =
      new Date('2026-08-20T22:00:00.000Z');

    const instance =
      createServiceInstance({
        key: 'nextcloud-home-prod',
        serviceId,
        nodeId,
        environment: 'production',
        createdAt,
      });

    expect(instance.id).toBeTruthy();
    expect(instance.key).toBe(
      'nextcloud-home-prod',
    );
    expect(instance.serviceId).toBe(
      serviceId,
    );
    expect(instance.nodeId).toBe(nodeId);
    expect(instance.environment).toBe(
      'production',
    );
    expect(instance.createdAt).toEqual(
      createdAt,
    );
  });

  it('normalizes environment values', () => {
    expect(
      createEnvironment('  Production  '),
    ).toBe('production');
  });

  it('normalizes instance keys', () => {
    expect(
      createServiceInstanceKey(
        '  Nextcloud-Home-Prod  ',
      ),
    ).toBe('nextcloud-home-prod');
  });

  it('rejects invalid environments', () => {
    expect(() =>
      createEnvironment(
        'Production Environment',
      ),
    ).toThrow();
  });
});
