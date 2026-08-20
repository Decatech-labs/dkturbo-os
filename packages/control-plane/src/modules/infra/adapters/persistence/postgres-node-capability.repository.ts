import type { Kysely } from 'kysely';

import type { Database } from '../../../../infrastructure/postgres/database.js';
import type {
  CapabilityKey,
  NodeCapability,
} from '../../domain/node-capability.js';
import type { NodeId } from '../../domain/node.js';
import type { NodeCapabilityRepository } from '../../ports/node-capability-repository.port.js';

export class PostgresNodeCapabilityRepository
  implements NodeCapabilityRepository
{
  constructor(
    private readonly database: Kysely<Database>,
  ) {}

  async save(
    capability: NodeCapability,
  ): Promise<void> {
    await this.database
      .insertInto('infra.node_capabilities')
      .values({
        node_id: capability.nodeId,
        capability_key: capability.key,
        registered_at: capability.registeredAt,
      })
      .onConflict((conflict) =>
        conflict
          .columns([
            'node_id',
            'capability_key',
          ])
          .doNothing(),
      )
      .execute();
  }

  async listByNodeId(
    nodeId: NodeId,
  ): Promise<NodeCapability[]> {
    const rows = await this.database
      .selectFrom('infra.node_capabilities')
      .selectAll()
      .where('node_id', '=', nodeId)
      .orderBy('capability_key', 'asc')
      .execute();

    return rows.map((row) => ({
      nodeId: row.node_id as NodeId,
      key: row.capability_key as CapabilityKey,
      registeredAt: row.registered_at,
    }));
  }

  async exists(
    nodeId: NodeId,
    key: CapabilityKey,
  ): Promise<boolean> {
    const row = await this.database
      .selectFrom('infra.node_capabilities')
      .select('node_id')
      .where('node_id', '=', nodeId)
      .where('capability_key', '=', key)
      .executeTakeFirst();

    return row !== undefined;
  }
}
