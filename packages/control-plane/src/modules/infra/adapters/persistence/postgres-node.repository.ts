import type { Kysely } from 'kysely';

import type { Database } from '../../../../infrastructure/postgres/database.js';
import type {
  Node,
  NodeId,
} from '../../domain/node.js';
import type { NodeRepository } from '../../ports/node-repository.port.js';

export class PostgresNodeRepository implements NodeRepository {
  constructor(
    private readonly database: Kysely<Database>,
  ) {}

  async save(node: Node): Promise<void> {
    await this.database
      .insertInto('infra.nodes')
      .values({
        id: node.id,
        name: node.name,
        hostname: node.hostname,
        created_at: node.createdAt,
      })
      .execute();
  }

  async list(): Promise<Node[]> {
    const rows = await this.database
      .selectFrom('infra.nodes')
      .selectAll()
      .orderBy('created_at', 'asc')
      .execute();

    return rows.map((row) => ({
      id: row.id as NodeId,
      name: row.name,
      hostname: row.hostname,
      createdAt: row.created_at,
    }));
  }
}
