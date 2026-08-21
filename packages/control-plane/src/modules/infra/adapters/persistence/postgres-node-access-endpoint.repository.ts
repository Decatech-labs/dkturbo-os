import type { Kysely } from 'kysely';

import type { Database } from '../../../../infrastructure/postgres/database.js';
import type {
  NodeAccessEndpoint,
  NodeAccessEndpointId,
  NodeAccessTransport,
} from '../../domain/node-access-endpoint.js';
import type { NodeId } from '../../domain/node.js';
import type { NodeAccessEndpointRepository } from '../../ports/node-access-endpoint-repository.port.js';

export class PostgresNodeAccessEndpointRepository
  implements NodeAccessEndpointRepository
{
  constructor(
    private readonly database:
      Kysely<Database>,
  ) {}

  async save(
    endpoint: NodeAccessEndpoint,
  ): Promise<void> {
    await this.database
      .insertInto(
        'infra.node_access_endpoints',
      )
      .values({
        id: endpoint.id,
        node_id: endpoint.nodeId,
        transport: endpoint.transport,
        label: endpoint.label,
        host: endpoint.host,
        port: endpoint.port,
        username: endpoint.username,
        priority: endpoint.priority,
        enabled: endpoint.enabled,
        created_at: endpoint.createdAt,
      })
      .execute();
  }

  async findPreferred(
    nodeId: NodeId,
    transport: NodeAccessTransport,
  ): Promise<NodeAccessEndpoint | null> {
    const row = await this.database
      .selectFrom(
        'infra.node_access_endpoints',
      )
      .selectAll()
      .where('node_id', '=', nodeId)
      .where(
        'transport',
        '=',
        transport,
      )
      .where('enabled', '=', true)
      .orderBy('priority', 'asc')
      .orderBy('created_at', 'asc')
      .executeTakeFirst();

    return row
      ? {
          id:
            row.id as NodeAccessEndpointId,
          nodeId:
            row.node_id as NodeId,
          transport:
            row.transport as NodeAccessTransport,
          label: row.label,
          host: row.host,
          port: row.port,
          username: row.username,
          priority: row.priority,
          enabled: row.enabled,
          createdAt: row.created_at,
        }
      : null;
  }

  async listByNodeId(
    nodeId: NodeId,
  ): Promise<NodeAccessEndpoint[]> {
    const rows = await this.database
      .selectFrom(
        'infra.node_access_endpoints',
      )
      .selectAll()
      .where('node_id', '=', nodeId)
      .orderBy('priority', 'asc')
      .orderBy('created_at', 'asc')
      .execute();

    return rows.map((row) => ({
      id:
        row.id as NodeAccessEndpointId,
      nodeId:
        row.node_id as NodeId,
      transport:
        row.transport as NodeAccessTransport,
      label: row.label,
      host: row.host,
      port: row.port,
      username: row.username,
      priority: row.priority,
      enabled: row.enabled,
      createdAt: row.created_at,
    }));
  }
}
