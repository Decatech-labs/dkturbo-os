import { describe, expect, it } from 'vitest';

import type { Node } from '../domain/node.js';
import type { NodeRepository } from '../ports/node-repository.port.js';
import { RegisterNode } from './register-node.js';

class FakeNodeRepository implements NodeRepository {
  public readonly nodes: Node[] = [];

  async save(node: Node): Promise<void> {
    this.nodes.push(node);
  }

  async list(): Promise<Node[]> {
    return this.nodes;
  }
}

describe('RegisterNode', () => {
  it('creates and saves a node', async () => {
    const repository = new FakeNodeRepository();
    const registerNode = new RegisterNode(repository);

    const node = await registerNode.execute({
      name: 'DK-NODE-HOME-01',
      hostname: 'dk-node-home-01',
    });

    expect(repository.nodes).toHaveLength(1);
    expect(repository.nodes[0]?.id).toBe(node.id);
    expect(repository.nodes[0]?.name).toBe('DK-NODE-HOME-01');
    expect(repository.nodes[0]?.hostname).toBe('dk-node-home-01');
  });
});
