import type { Kysely } from 'kysely';

import type { Database } from '../infrastructure/postgres/database.js';
import { ListNodes } from '../modules/infra/application/list-nodes.js';
import { RegisterNode } from '../modules/infra/application/register-node.js';
import { PostgresNodeRepository } from '../modules/infra/adapters/persistence/postgres-node.repository.js';

export interface CreateControlPlaneOptions {
  database: Kysely<Database>;
}

export const createControlPlane = ({
  database,
}: CreateControlPlaneOptions) => {
  const nodeRepository = new PostgresNodeRepository(database);

  return {
    infra: {
      registerNode: new RegisterNode(nodeRepository),
      listNodes: new ListNodes(nodeRepository),
    },
  };
};

export type ControlPlane = ReturnType<typeof createControlPlane>;
