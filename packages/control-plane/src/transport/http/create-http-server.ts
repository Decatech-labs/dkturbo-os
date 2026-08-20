import {
  nodeParamsSchema,
  registerNodeRequestSchema,
  nodeCapabilityParamsSchema,
  registerServiceRequestSchema,
  registerServiceInstanceRequestSchema,
  type NodeObservedStateResponse,
  type NodeResponse,
  type NodeStatusResponse,
  type NodeCapabilityResponse,
  type ServiceResponse,
  type ServiceInstanceResponse,
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
import { ServiceKeyAlreadyRegisteredError } from '../../modules/infra/application/errors/service-key-already-registered.error.js';
import { ServiceInstanceKeyAlreadyRegisteredError } from '../../modules/infra/application/errors/service-instance-key-already-registered.error.js';
import { ServiceNotFoundError } from '../../modules/infra/application/errors/service-not-found.error.js';
import type { ServiceId } from '../../modules/infra/domain/service.js';

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

      if (
        error instanceof
        ServiceKeyAlreadyRegisteredError
      ) {
        return reply.code(409).send({
          error: 'service_key_already_registered',
          serviceKey: error.serviceKey,
        });
      }

      if (error instanceof ServiceNotFoundError) {
        return reply.code(404).send({
          error: 'service_not_found',
        });
      }

      if (
        error instanceof
        ServiceInstanceKeyAlreadyRegisteredError
      ) {
        return reply.code(409).send({
          error:
            'service_instance_key_already_registered',
          instanceKey: error.instanceKey,
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

  app.post(
    '/api/services',
    async (request, reply) => {
      const parsed =
        registerServiceRequestSchema.safeParse(
          request.body,
        );

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }

      const service =
        await controlPlane.infra.registerService.execute(
          parsed.data,
        );

      const response: ServiceResponse = {
        id: service.id,
        key: service.key,
        name: service.name,
        createdAt:
          service.createdAt.toISOString(),
      };

      return reply.code(201).send(response);
    },
  );

  app.get('/api/services', async () => {
    const services =
      await controlPlane.infra.listServices.execute();

    const response: ServiceResponse[] =
      services.map((service) => ({
        id: service.id,
        key: service.key,
        name: service.name,
        createdAt:
          service.createdAt.toISOString(),
      }));

    return response;
  });

  app.post(
    '/api/service-instances',
    async (request, reply) => {
      const parsed =
        registerServiceInstanceRequestSchema.safeParse(
          request.body,
        );

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }

      const instance =
        await controlPlane.infra.registerServiceInstance.execute(
          {
            key: parsed.data.key,
            serviceId:
              parsed.data.serviceId as ServiceId,
            nodeId:
              parsed.data.nodeId as NodeId,
            environment:
              parsed.data.environment,
          },
        );

      const response: ServiceInstanceResponse = {
        id: instance.id,
        key: instance.key,
        serviceId: instance.serviceId,
        nodeId: instance.nodeId,
        environment: instance.environment,
        createdAt:
          instance.createdAt.toISOString(),
      };

      return reply.code(201).send(response);
    },
  );

  app.get(
    '/api/service-instances',
    async () => {
      const instances =
        await controlPlane.infra.listServiceInstances.execute();

      const response: ServiceInstanceResponse[] =
        instances.map((instance) => ({
          id: instance.id,
          key: instance.key,
          serviceId: instance.serviceId,
          nodeId: instance.nodeId,
          environment: instance.environment,
          createdAt:
            instance.createdAt.toISOString(),
        }));

      return response;
    },
  );

  return app;
};
