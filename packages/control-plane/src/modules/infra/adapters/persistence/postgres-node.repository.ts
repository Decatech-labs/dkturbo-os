import type { Kysely } from 'kysely';
import { DatabaseError } from 'pg';

import type { Database } from '../../../../infrastructure/postgres/database.js';
import { NodeHostnameAlreadyRegisteredError } from '../../application/errors/node-hostname-already-registered.error.js';
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
    try {
      await this.database
        .insertInto('infra.nodes')
        .values({
          id: node.id,
          name: node.name,
          hostname: node.hostname,
          created_at: node.createdAt,
        })
        .execute();
    } catch (error) {
      if (
        error instanceof DatabaseError &&
        error.code === '23505' &&
        error.constraint === 'nodes_hostname_unique'
      ) {
        throw new NodeHostnameAlreadyRegisteredError(
          node.hostname,
        );
      }

      throw error;
    }
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

  async findById(id: NodeId): Promise<Node | null> {
    const row = await this.database
      .selectFrom('infra.nodes')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      id: row.id as NodeId,
      name: row.name,
      hostname: row.hostname,
      createdAt: row.created_at,
    };
  }
}
