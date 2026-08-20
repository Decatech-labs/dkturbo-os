import {
  nodeParamsSchema,
  registerNodeRequestSchema,
  type NodeResponse,
} from '@dkturbo/contracts';
import Fastify, {
  type FastifyInstance,
} from 'fastify';
import type { Kysely } from 'kysely';

import type { ControlPlane } from '../../composition/create-control-plane.js';
import {
  checkDatabase,
  type Database,
} from '../../infrastructure/postgres/index.js';
import type {
  Node,
  NodeId,
} from '../../modules/infra/domain/node.js';
import { NodeNotFoundError } from '../../modules/infra/application/errors/node-not-found.error.js';
import { NodeHostnameAlreadyRegisteredError } from '../../modules/infra/application/errors/node-hostname-already-registered.error.js';

export interface CreateHttpServerOptions {
  database: Kysely<Database>;
  controlPlane: ControlPlane;
}

const toNodeResponse = (
  node: Node,
): NodeResponse => ({
  id: node.id,
  name: node.name,
  hostname: node.hostname,
  createdAt: node.createdAt.toISOString(),
});

export const createHttpServer = ({
  database,
  controlPlane,
}: CreateHttpServerOptions): FastifyInstance => {
  const app = Fastify({
    logger: true,
  });

  app.get('/health/live', async () => ({
    status: 'ok',
  }));

  app.get('/health/ready', async (_request, reply) => {
    try {
      await checkDatabase(database);

      return {
        status: 'ready',
        database: 'ok',
      };
    } catch {
      return reply.code(503).send({
        status: 'not-ready',
        database: 'unavailable',
      });
    }
  });

  app.post('/api/nodes', async (request, reply) => {
    const parsed = registerNodeRequestSchema.safeParse(
      request.body,
    );

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'invalid_request',
        details: parsed.error.issues,
      });
    }

    try {
      const node =
        await controlPlane.infra.registerNode.execute(
          parsed.data,
        );

      return reply
        .code(201)
        .send(toNodeResponse(node));
    } catch (error) {
      if (
        error instanceof
        NodeHostnameAlreadyRegisteredError
      ) {
        return reply.code(409).send({
          error: 'node_hostname_already_registered',
          hostname: error.hostname,
        });
      }

      throw error;
    }
  });

  app.get('/api/nodes', async () => {
    const nodes =
      await controlPlane.infra.listNodes.execute();

    return nodes.map(toNodeResponse);
  });

  app.get('/api/nodes/:id', async (request, reply) => {
    const parsed = nodeParamsSchema.safeParse(
      request.params,
    );

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'invalid_request',
        details: parsed.error.issues,
      });
    }

    try {
      const node =
        await controlPlane.infra.getNode.execute(
          parsed.data.id as NodeId,
        );

      return toNodeResponse(node);
    } catch (error) {
      if (error instanceof NodeNotFoundError) {
        return reply.code(404).send({
          error: 'node_not_found',
        });
      }

      throw error;
    }
  });

  return app;
};
