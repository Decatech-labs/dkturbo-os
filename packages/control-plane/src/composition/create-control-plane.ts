import type { Kysely } from 'kysely';

import type { Database } from '../infrastructure/postgres/database.js';
import { GetNode } from '../modules/infra/application/get-node.js';
import { ListNodes } from '../modules/infra/application/list-nodes.js';
import { RegisterNode } from '../modules/infra/application/register-node.js';
import { PostgresNodeRepository } from '../modules/infra/adapters/persistence/postgres-node.repository.js';
import { GetNodeObservedState } from '../modules/infra/application/get-node-observed-state.js';
import { RecordNodeHeartbeat } from '../modules/infra/application/record-node-heartbeat.js';
import { PostgresNodeObservedStateRepository } from '../modules/infra/adapters/persistence/postgres-node-observed-state.repository.js';
import { SystemClock } from '../infrastructure/clock/system-clock.js';
import { GetNodeStatus } from '../modules/infra/application/get-node-status.js';
import { ListNodeCapabilities } from '../modules/infra/application/list-node-capabilities.js';
import { RegisterNodeCapability } from '../modules/infra/application/register-node-capability.js';
import { PostgresNodeCapabilityRepository } from '../modules/infra/adapters/persistence/postgres-node-capability.repository.js';

export interface CreateControlPlaneOptions {
  database: Kysely<Database>;
}

export const createControlPlane = ({
  database,
}: CreateControlPlaneOptions) => {
  const nodeRepository = new PostgresNodeRepository(database);
  const nodeObservedStateRepository =
  new PostgresNodeObservedStateRepository(database);
  const clock = new SystemClock();
  const nodeCapabilityRepository =
  new PostgresNodeCapabilityRepository(database);

  return {
    infra: {
      registerNode: new RegisterNode(nodeRepository),
      listNodes: new ListNodes(nodeRepository),
      getNode: new GetNode(nodeRepository),
      recordNodeHeartbeat: new RecordNodeHeartbeat(
        nodeRepository,
        nodeObservedStateRepository,
        clock,
      ),
      getNodeObservedState: new GetNodeObservedState(
        nodeRepository,
        nodeObservedStateRepository,
      ),
      getNodeStatus: new GetNodeStatus(
        nodeRepository,
        nodeObservedStateRepository,
        clock,
      ),
      registerNodeCapability: new RegisterNodeCapability(
        nodeRepository,
        nodeCapabilityRepository,
        clock,
      ),
      listNodeCapabilities: new ListNodeCapabilities(
        nodeRepository,
        nodeCapabilityRepository,
      ),
    },
  };
};

export type ControlPlane = ReturnType<typeof createControlPlane>;
