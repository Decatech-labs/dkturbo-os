import { describe, expect, it } from 'vitest';

import { createCapabilityKey } from './node-capability.js';

describe('createCapabilityKey', () => {
  it('accepts simple capability keys', () => {
    expect(
      createCapabilityKey('docker'),
    ).toBe('docker');
  });

  it('accepts namespaced capability keys', () => {
    expect(
      createCapabilityKey('system.metrics'),
    ).toBe('system.metrics');
  });

  it('normalizes whitespace and casing', () => {
    expect(
      createCapabilityKey('  Docker  '),
    ).toBe('docker');
  });

  it('rejects invalid capability keys', () => {
    expect(() =>
      createCapabilityKey('system metrics'),
    ).toThrow();

    expect(() =>
      createCapabilityKey('system..metrics'),
    ).toThrow();
  });
});
