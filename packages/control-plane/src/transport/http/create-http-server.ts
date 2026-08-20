import {
  nodeParamsSchema,
  registerNodeRequestSchema,
  nodeCapabilityParamsSchema,
  type NodeObservedStateResponse,
  type NodeResponse,
  type NodeStatusResponse,
  type NodeCapabilityResponse,
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
import { NodeHostnameAlreadyRegisteredError } from '../../modules/infra/application/errors/node-hostname-already-registered.error.js';
import { NodeNotFoundError } from '../../modules/infra/application/errors/node-not-found.error.js';
import type {
  Node,
  NodeId,
} from '../../modules/infra/domain/node.js';

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

  app.setErrorHandler(
    (error, _request, reply) => {
      if (error instanceof NodeNotFoundError) {
        return reply.code(404).send({
          error: 'node_not_found',
        });
      }

      if (
        error instanceof
        NodeHostnameAlreadyRegisteredError
      ) {
        return reply.code(409).send({
          error: 'node_hostname_already_registered',
          hostname: error.hostname,
        });
      }

      app.log.error(error);

      return reply.code(500).send({
        error: 'internal_error',
      });
    },
  );

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
    const parsed =
      registerNodeRequestSchema.safeParse(
        request.body,
      );

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'invalid_request',
        details: parsed.error.issues,
      });
    }

    const node =
      await controlPlane.infra.registerNode.execute(
        parsed.data,
      );

    return reply
      .code(201)
      .send(toNodeResponse(node));
  });

  app.get('/api/nodes', async () => {
    const nodes =
      await controlPlane.infra.listNodes.execute();

    return nodes.map(toNodeResponse);
  });

  app.get(
    '/api/nodes/:id',
    async (request, reply) => {
      const parsed = nodeParamsSchema.safeParse(
        request.params,
      );

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }

      const node =
        await controlPlane.infra.getNode.execute(
          parsed.data.id as NodeId,
        );

      return toNodeResponse(node);
    },
  );

  app.post(
    '/api/nodes/:id/heartbeat',
    async (request, reply) => {
      const parsed = nodeParamsSchema.safeParse(
        request.params,
      );

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }

      const state =
        await controlPlane.infra.recordNodeHeartbeat.execute(
          parsed.data.id as NodeId,
        );

      const response: NodeObservedStateResponse = {
        nodeId: state.nodeId,
        lastSeenAt: state.lastSeenAt.toISOString(),
      };

      return response;
    },
  );

  app.get(
    '/api/nodes/:id/observed-state',
    async (request, reply) => {
      const parsed = nodeParamsSchema.safeParse(
        request.params,
      );

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }

      const state =
        await controlPlane.infra.getNodeObservedState.execute(
          parsed.data.id as NodeId,
        );

      const response: NodeObservedStateResponse = {
        nodeId: parsed.data.id,
        lastSeenAt:
          state?.lastSeenAt.toISOString() ?? null,
      };

      return response;
    },
  );

  app.get(
    '/api/nodes/:id/status',
    async (request, reply) => {
      const parsed = nodeParamsSchema.safeParse(
        request.params,
      );

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }

      const status =
        await controlPlane.infra.getNodeStatus.execute(
          parsed.data.id as NodeId,
        );

      const response: NodeStatusResponse = {
        nodeId: status.nodeId,
        status: status.status,
        lastSeenAt:
          status.lastSeenAt?.toISOString() ?? null,
      };

      return response;
    },
  );

  app.put(
    '/api/nodes/:id/capabilities/:capabilityKey',
    async (request, reply) => {
      const parsed =
        nodeCapabilityParamsSchema.safeParse(
          request.params,
        );

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }

      const capability =
        await controlPlane.infra.registerNodeCapability.execute(
          {
            nodeId: parsed.data.id as NodeId,
            capabilityKey:
              parsed.data.capabilityKey,
          },
        );

      const response: NodeCapabilityResponse = {
        nodeId: capability.nodeId,
        key: capability.key,
        registeredAt:
          capability.registeredAt.toISOString(),
      };

      return response;
    },
  );

  app.get(
    '/api/nodes/:id/capabilities',
    async (request, reply) => {
      const parsed = nodeParamsSchema.safeParse(
        request.params,
      );

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }

      const capabilities =
        await controlPlane.infra.listNodeCapabilities.execute(
          parsed.data.id as NodeId,
        );

      const response: NodeCapabilityResponse[] =
        capabilities.map((capability) => ({
          nodeId: capability.nodeId,
          key: capability.key,
          registeredAt:
            capability.registeredAt.toISOString(),
        }));

      return response;
    },
  );

  return app;
};
