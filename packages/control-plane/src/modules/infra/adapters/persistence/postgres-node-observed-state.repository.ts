import type { Kysely } from 'kysely';

import type { Database } from '../../../../infrastructure/postgres/database.js';
import type { NodeObservedState } from '../../domain/node-observed-state.js';
import type { NodeId } from '../../domain/node.js';
import type { NodeObservedStateRepository } from '../../ports/node-observed-state-repository.port.js';

export class PostgresNodeObservedStateRepository
  implements NodeObservedStateRepository
{
  constructor(
    private readonly database: Kysely<Database>,
  ) {}

  async save(
    state: NodeObservedState,
  ): Promise<void> {
    await this.database
      .insertInto('infra.node_observed_state')
      .values({
        node_id: state.nodeId,
        last_seen_at: state.lastSeenAt,
      })
      .onConflict((conflict) =>
        conflict
          .column('node_id')
          .doUpdateSet({
            last_seen_at: state.lastSeenAt,
          }),
      )
      .execute();
  }

  async findByNodeId(
    nodeId: NodeId,
  ): Promise<NodeObservedState | null> {
    const row = await this.database
      .selectFrom('infra.node_observed_state')
      .selectAll()
      .where('node_id', '=', nodeId)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      nodeId: row.node_id as NodeId,
      lastSeenAt: row.last_seen_at,
    };
  }
}
