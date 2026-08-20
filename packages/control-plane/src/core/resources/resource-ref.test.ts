import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createResourceRef,
  resourceRefsEqual,
  serializeResourceRef,
} from './resource-ref.js';

describe('ResourceRef', () => {
  it('creates a valid resource reference', () => {
    const ref = createResourceRef({
      kind: 'infra.node',
      id: '123',
    });

    expect(ref.kind).toBe('infra.node');
    expect(ref.id).toBe('123');
  });

  it('normalizes resource kinds', () => {
    const ref = createResourceRef({
      kind: '  Infra.Node  ',
      id: '123',
    });

    expect(ref.kind).toBe('infra.node');
  });

  it('rejects invalid resource kinds', () => {
    expect(() =>
      createResourceRef({
        kind: 'infra node',
        id: '123',
      }),
    ).toThrow();
  });

  it('rejects empty resource ids', () => {
    expect(() =>
      createResourceRef({
        kind: 'infra.node',
        id: '   ',
      }),
    ).toThrow(
      'Resource id cannot be empty',
    );
  });

  it('compares resource references', () => {
    const first = createResourceRef({
      kind: 'infra.node',
      id: '123',
    });

    const second = createResourceRef({
      kind: 'infra.node',
      id: '123',
    });

    const different = createResourceRef({
      kind: 'infra.service',
      id: '123',
    });

    expect(
      resourceRefsEqual(first, second),
    ).toBe(true);

    expect(
      resourceRefsEqual(first, different),
    ).toBe(false);
  });

  it('serializes resource references', () => {
    const ref = createResourceRef({
      kind: 'infra.service-instance',
      id: '123',
    });

    expect(
      serializeResourceRef(ref),
    ).toBe(
      'infra.service-instance:123',
    );
  });
});
