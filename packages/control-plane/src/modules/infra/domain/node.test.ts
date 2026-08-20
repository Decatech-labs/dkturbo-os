import { describe, expect, it } from 'vitest';

import { createNode } from './node.js';

describe('createNode', () => {
  it('creates a valid node', () => {
    const node = createNode({
      name: 'DK-NODE-HOME-01',
      hostname: 'dk-node-home-01',
    });

    expect(node.id).toBeTruthy();
    expect(node.name).toBe('DK-NODE-HOME-01');
    expect(node.hostname).toBe('dk-node-home-01');
    expect(node.createdAt).toBeInstanceOf(Date);
  });

  it('trims name and hostname', () => {
    const node = createNode({
      name: '  DK-NODE-HOME-01  ',
      hostname: '  dk-node-home-01  ',
    });

    expect(node.name).toBe('DK-NODE-HOME-01');
    expect(node.hostname).toBe('dk-node-home-01');
  });

  it('rejects an empty name', () => {
    expect(() =>
      createNode({
        name: '   ',
        hostname: 'dk-node-home-01',
      }),
    ).toThrow('Node name cannot be empty');
  });

  it('rejects an empty hostname', () => {
    expect(() =>
      createNode({
        name: 'DK-NODE-HOME-01',
        hostname: '   ',
      }),
    ).toThrow('Node hostname cannot be empty');
  });
});
