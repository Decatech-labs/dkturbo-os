import { describe, expect, it } from 'vitest';

import type {
  Node,
  NodeId,
} from '../domain/node.js';
import type { NodeRepository } from '../ports/node-repository.port.js';
import { NodeNotFoundError } from './errors/node-not-found.error.js';
import { GetNode } from './get-node.js';

class FakeNodeRepository implements NodeRepository {
  constructor(
    private readonly nodes: Node[],
  ) {}

  async save(_node: Node): Promise<void> {}

  async list(): Promise<Node[]> {
    return this.nodes;
  }

  async findById(id: NodeId): Promise<Node | null> {
    return this.nodes.find((node) => node.id === id) ?? null;
  }
}

describe('GetNode', () => {
  it('returns an existing node', async () => {
    const node: Node = {
      id: '11111111-1111-4111-8111-111111111111' as NodeId,
      name: 'DK-NODE-HOME-01',
      hostname: 'dk-node-home-01',
      createdAt: new Date('2026-08-20T20:00:00.000Z'),
    };

    const repository = new FakeNodeRepository([node]);
    const getNode = new GetNode(repository);

    const result = await getNode.execute(node.id);

    expect(result).toEqual(node);
  });

  it('throws NodeNotFoundError when the node does not exist', async () => {
    const repository = new FakeNodeRepository([]);
    const getNode = new GetNode(repository);

    const missingId =
      '22222222-2222-4222-8222-222222222222' as NodeId;

    await expect(
      getNode.execute(missingId),
    ).rejects.toBeInstanceOf(NodeNotFoundError);
  });
});
