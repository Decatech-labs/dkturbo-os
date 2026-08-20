import { describe, expect, it } from 'vitest';

import {
  createService,
  createServiceKey,
} from './service.js';

describe('Service', () => {
  it('creates a valid service', () => {
    const createdAt =
      new Date('2026-08-20T20:00:00.000Z');

    const service = createService({
      key: 'nextcloud',
      name: 'Nextcloud',
      createdAt,
    });

    expect(service.id).toBeTruthy();
    expect(service.key).toBe('nextcloud');
    expect(service.name).toBe('Nextcloud');
    expect(service.createdAt).toEqual(
      createdAt,
    );
  });

  it('normalizes service keys', () => {
    expect(
      createServiceKey('  OpenBrass  '),
    ).toBe('openbrass');
  });

  it('rejects invalid service keys', () => {
    expect(() =>
      createServiceKey('open brass'),
    ).toThrow();

    expect(() =>
      createServiceKey('open.brass'),
    ).toThrow();
  });

  it('rejects an empty service name', () => {
    expect(() =>
      createService({
        key: 'nextcloud',
        name: '   ',
        createdAt: new Date(),
      }),
    ).toThrow(
      'Service name cannot be empty',
    );
  });
});
