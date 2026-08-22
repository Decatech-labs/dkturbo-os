import {
  nodeParamsSchema,
  registerNodeRequestSchema,
  nodeCapabilityParamsSchema,
  registerServiceRequestSchema,
  registerServiceInstanceRequestSchema,
  requestActionRequestSchema,
  actionRequestParamsSchema,
  approvalRequestParamsSchema,
  decideApprovalRequestSchema,
  type NodeObservedStateResponse,
  type NodeResponse,
  type NodeStatusResponse,
  type NodeCapabilityResponse,
  type ServiceResponse,
  type ServiceInstanceResponse,
  type ActionRequestResponse,
  type AuthorizationDecisionResponse,
  type ProcessActionRequestResponse,
} from '@dkturbo/contracts';
import Fastify, {
  type FastifyInstance,
} from 'fastify';
import type { Kysely } from 'kysely';

import type { ControlPlane } from '../../composition/create-control-plane.js';
import type {
  ApprovalRequestId,
} from '../../core/authorization/domain/approval-request.js';
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
import {
  createResourceRef,
} from '../../core/resources/index.js';
import {
  createActorRef,
} from '../../core/actors/index.js';
import { ActionRequestNotFoundError } from '../../core/actions/application/errors/action-request-not-found.error.js';
import type { ActionRequestId } from '../../core/actions/domain/action-request.js';
import {
  RequiredCapabilityMissingError,
} from '../../core/actions/application/prepare-action-execution.js';
import { fromNodeHeaders } from 'better-auth/node';
import type { BetterAuthInstance } from '../../infrastructure/auth/better-auth.js';
import type {
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import type {
  ActorRef,
} from '../../core/actors/index.js';
import { z } from 'zod';
import type {
  ActionExecutionId,
} from '../../core/actions/domain/action-execution.js';

export interface CreateHttpServerOptions {
  database: Kysely<Database>;
  controlPlane: ControlPlane;
  auth: BetterAuthInstance;
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
  auth,
}: CreateHttpServerOptions): FastifyInstance => {
  const app = Fastify({
    logger: true,
  });

  const requireAuthenticatedActor = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<ActorRef | null> => {
    const session =
      await auth.api.getSession({
        headers:
          fromNodeHeaders(
            request.headers,
          ),
      });

    if (!session) {
      await reply
        .code(401)
        .send({
          error:
            'authentication_required',
        });

      return null;
    }

    return createActorRef({
      kind: 'user',
      id: session.user.id,
    });
  };

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

      if (
        error instanceof
        ActionRequestNotFoundError
      ) {
        return reply.code(404).send({
          error: 'action_request_not_found',
        });
      }

      if (
        error instanceof
        RequiredCapabilityMissingError
      ) {
        return reply.code(409).send({
          error:
            'required_capability_missing',
          capability: error.capability,
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

      const response:
        NodeObservedStateResponse = {
        nodeId:
          state.nodeId,

        lastSeenAt:
          state.lastSeenAt
            .toISOString(),

        runtimeCollectedAt:
          state.runtimeCollectedAt
            ?.toISOString() ??
          null,

        runtimeSnapshot:
          state.runtimeSnapshot,
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

      const response:
        NodeObservedStateResponse = {
        nodeId:
          parsed.data.id,

        lastSeenAt:
          state?.lastSeenAt
            .toISOString() ??
          null,

        runtimeCollectedAt:
          state?.runtimeCollectedAt
            ?.toISOString() ??
          null,

        runtimeSnapshot:
          state?.runtimeSnapshot ??
          null,
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

      const response:
        NodeStatusResponse = {
        nodeId:
          status.nodeId,

        status:
          status.status,

        lastSeenAt:
          status.lastSeenAt
            ?.toISOString() ??
          null,

        runtimeCollectedAt:
          status.runtimeCollectedAt
            ?.toISOString() ??
          null,
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

  app.post(
    '/api/action-requests',
    async (request, reply) => {
      const actor =
        await requireAuthenticatedActor(
          request,
          reply,
        );

      if (!actor) {
        return;
      }

      const parsed =
        requestActionRequestSchema.safeParse(
          request.body,
        );

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }

      const actionRequest =
        await controlPlane.actions.requestAction.execute(
          {
            actionKey:
              parsed.data.actionKey,

            target: createResourceRef(
              parsed.data.target,
            ),

            requestedBy: actor,

            parameters:
              parsed.data.parameters,
          },
        );

      const response: ActionRequestResponse = {
        id: actionRequest.id,
        actionKey:
          actionRequest.actionKey,
        target:
          actionRequest.target,
        requestedBy:
          actionRequest.requestedBy,
        parameters:
          actionRequest.parameters,
        status:
          actionRequest.status,
        requestedAt:
          actionRequest.requestedAt.toISOString(),
      };

      return reply
        .code(201)
        .send(response);
    },
  );

  app.get(
    '/api/action-requests',
    async () => {
      const requests =
        await controlPlane.actions.listActionRequests.execute();

      const response: ActionRequestResponse[] =
        requests.map((request) => ({
          id: request.id,
          actionKey: request.actionKey,
          target: request.target,
          requestedBy: request.requestedBy,
          parameters: request.parameters,
          status: request.status,
          requestedAt:
            request.requestedAt.toISOString(),
        }));

      return response;
    },
  );

  app.get(
    '/api/action-requests/:id/authorization',
    async (request, reply) => {
      const parsed =
        actionRequestParamsSchema.safeParse(
          request.params,
        );

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }

      const decision =
        await controlPlane.authorization.authorizeActionRequest.execute(
          parsed.data.id as ActionRequestId,
        );

      const response: AuthorizationDecisionResponse = {
        outcome: decision.outcome,
        reason: decision.reason,
      };

      return response;
    },
  );

  app.post(
    '/api/action-requests/:id/process',
    async (request, reply) => {
      const parsed =
        actionRequestParamsSchema.safeParse(
          request.params,
        );

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }

      const result =
        await controlPlane.actions.processActionRequest.execute(
          parsed.data.id as ActionRequestId,
        );

      let response:
        ProcessActionRequestResponse;

      switch (result.outcome) {
        case 'DENIED':
          response = {
            outcome: 'DENIED',
          };
          break;

        case 'STEP_UP_REQUIRED':
          response = {
            outcome:
              'STEP_UP_REQUIRED',
          };
          break;

        case 'APPROVAL_REQUIRED':
          response = {
            outcome:
              'APPROVAL_REQUIRED',
            approvalRequestId:
              result.approval.id,
          };
          break;

        case 'READY':
          response = {
            outcome: 'READY',
            executionId:
              result.execution.id,
          };
          break;
      }

      return response;
    },
  );

  app.post(
    '/api/approval-requests/:id/decision',
    async (request, reply) => {
      const actor =
        await requireAuthenticatedActor(
          request,
          reply,
        );

      if (!actor) {
        return;
      }

      const params =
        approvalRequestParamsSchema.safeParse(
          request.params,
        );

      const body =
        decideApprovalRequestSchema.safeParse(
          request.body,
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.code(400).send({
          error: 'invalid_request',
        });
      }

      const result =
        await controlPlane.authorization.decideApprovalRequest.execute(
          {
            approvalRequestId:
              params.data.id as ApprovalRequestId,

            decision:
              body.data.decision,

            decidedBy: actor,
          },
        );

      if (
        result.outcome === 'REJECTED'
      ) {
        return {
          outcome: 'REJECTED',
        };
      }

      return {
        outcome: 'APPROVED',
        executionId:
          result.execution.id,
      };
    },
  );

  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',

    async handler(request, reply) {
      const url = new URL(
        request.url,
        `http://${request.headers.host}`,
      );

      const headers =
        fromNodeHeaders(
          request.headers,
        );

      const authRequest =
        new Request(
          url.toString(),
          {
            method:
              request.method,
            headers,
            ...(request.body
              ? {
                  body:
                    JSON.stringify(
                      request.body,
                    ),
                }
              : {}),
          },
        );

      const response =
        await auth.handler(
          authRequest,
        );

      reply.status(
        response.status,
      );

      response.headers.forEach(
        (value, key) => {
          reply.header(
            key,
            value,
          );
        },
      );

      const body =
        await response.text();

      return reply.send(body);
    },
  });

  app.post(
    '/api/action-executions/:id/execute',
    async (request, reply) => {
      const actor =
        await requireAuthenticatedActor(
          request,
          reply,
        );

      if (!actor) {
        return;
      }

      const params =
        z.object({
          id: z.string().uuid(),
        }).safeParse(
          request.params,
        );

      if (!params.success) {
        return reply
          .code(400)
          .send({
            error:
              'invalid_request',
          });
      }

      const execution =
        await controlPlane.actions
          .executeActionExecution
          .execute(
            params.data
              .id as ActionExecutionId,
          );

      return reply.send({
        id:
          execution.id,

        actionRequestId:
          execution.actionRequestId,

        nodeId:
          execution.nodeId,

        requiredCapability:
          execution.requiredCapability,

        status:
          execution.status,

        createdAt:
          execution.createdAt
            .toISOString(),

        startedAt:
          execution.startedAt
            ?.toISOString() ??
          null,

        finishedAt:
          execution.finishedAt
            ?.toISOString() ??
          null,

        result:
          execution.result,

        errorCode:
          execution.errorCode,

        errorMessage:
          execution.errorMessage,
      });
    },
  );

  app.post(
    '/api/nodes/:id/refresh-observed-state',
    async (request, reply) => {
      const actor =
        await requireAuthenticatedActor(
          request,
          reply,
        );

      if (!actor) {
        return;
      }

      const params =
        nodeParamsSchema.safeParse(
          request.params,
        );

      if (!params.success) {
        return reply
          .code(400)
          .send({
            error:
              'invalid_request',
            details:
              params.error.issues,
          });
      }

      const state =
        await controlPlane.infra
          .refreshNodeObservedState
          .execute(
            params.data.id as NodeId,
          );

      return reply.send({
        nodeId:
          state.nodeId,

        lastSeenAt:
          state.lastSeenAt
            .toISOString(),

        runtimeCollectedAt:
          state.runtimeCollectedAt
            ?.toISOString() ??
          null,

        runtimeSnapshot:
          state.runtimeSnapshot,
      });
    },
  );

  return app;
};
