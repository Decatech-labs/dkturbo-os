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
  serviceInstanceParamsSchema,
  createFamilyUserRequestSchema,
  familyUserParamsSchema,
  updateFamilyUserRoleRequestSchema,
  resetFamilyUserPasswordRequestSchema,
  grantFamilyPermissionRequestSchema,
  familyPermissionParamsSchema,
  accessPermissionKeys,
  accessPermissionKeySchema,
  setAccessPermissionRequestSchema,
  type NodeObservedStateResponse,
  type NodeResponse,
  type NodeStatusResponse,
  type NodeCapabilityResponse,
  type ServiceResponse,
  type ServiceInstanceResponse,
  type ActionRequestResponse,
  type AuthorizationDecisionResponse,
  type ProcessActionRequestResponse,
  type ServiceInstanceObservedStateResponse,
  type FamilyUserResponse,
  type PendingApprovalResponse,
  type FamilyPermissionResponse,
  type AccessPermissionKey,
  type AccessProfileResponse,
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
import type {
  ServiceInstanceId,
} from '../../modules/infra/domain/service-instance.js';
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
import type {
  UserId,
} from '../../core/identity/domain/user.js';
import {
  ActionExecutionNotFoundError,
  ActionRequestNotReadyForExecutionError,
} from '../../core/actions/application/execute-action-execution.js';
import type {
  UserActionPermissionId,
} from '../../core/authorization/domain/user-action-permission.js';
import {
  createActionKey,
} from '../../core/actions/domain/action-key.js';

const accessPermissionApp:
  Record<
    AccessPermissionKey,
    string
  > = {
    'app.system.access':
      'system',

    'system.services.restart':
      'system',

    'app.family.access':
      'family',

    'family.users.create':
      'family',

    'family.users.manage':
      'family',

    'app.files.access':
      'files',

    'app.photos.access':
      'photos',

    'app.automations.access':
      'automations',

    'app.security.access':
      'security',
  };

const createAccessPermissionTarget =
  (
    permission:
      AccessPermissionKey,
  ) =>
    createResourceRef({
      kind:
        'app',

      id:
        accessPermissionApp[
          permission
        ],
    });

export interface CreateHttpServerOptions {
  database: Kysely<Database>;
  controlPlane: ControlPlane;
  auth: HttpAuth;
  familyAuthProvisioner?: FamilyAuthProvisioner;
}

export interface HttpAuth {
  api: {
    getSession(
      input: {
        headers: Headers;
      },
    ): Promise<
      | {
          user: {
            id: string;
          };
        }
      | null
    >;
  };

  handler(
    request: Request,
  ): Promise<Response>;
}

export interface FamilyAuthProvisioner {
  createUser(
    input: {
      email: string;
      password: string;
      name: string;
    },
  ): Promise<{
    id: string;
    name: string;
    email: string;
  }>;

  removeUser(
    input: {
      userId: string;
      headers: Headers;
    },
  ): Promise<void>;

  setPassword(
    input: {
      userId: string;
      newPassword: string;
      headers: Headers;
    },
  ): Promise<void>;

  revokeSessions(
    input: {
      userId: string;
      headers: Headers;
    },
  ): Promise<void>;
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
  familyAuthProvisioner,
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

  const requireOwnerActor = async (
    request:
      FastifyRequest,
    reply:
      FastifyReply,
  ): Promise<ActorRef | null> => {
    const actor =
      await requireAuthenticatedActor(
        request,
        reply,
      );

    if (!actor) {
      return null;
    }

    if (
      actor.kind !==
      'user'
    ) {
      await reply
        .code(403)
        .send({
          error:
            'authorization_denied',
        });

      return null;
    }

    const user =
      await controlPlane
        .identity
        .getUser
        .execute(
          actor.id as UserId,
        );

    if (
      !user ||
      user.role !==
        'owner'
    ) {
      await reply
        .code(403)
        .send({
          error:
            'owner_required',
        });

      return null;
    }

    return actor;
  };

  const requireAccessPermission =
  async (
    request:
      FastifyRequest,

    reply:
      FastifyReply,

    permission:
      AccessPermissionKey,
  ): Promise<
    ActorRef | null
  > => {
    const actor =
      await requireAuthenticatedActor(
        request,
        reply,
      );

    if (!actor) {
      return null;
    }

    if (
      actor.kind !==
      'user'
    ) {
      await reply
        .code(403)
        .send({
          error:
            'authorization_denied',
        });

      return null;
    }

    const user =
      await controlPlane
        .identity
        .getUser
        .execute(
          actor.id as
            UserId,
        );

    if (!user) {
      await reply
        .code(403)
        .send({
          error:
            'authorization_denied',
        });

      return null;
    }

    /*
     * Owner bypass:
     * no almacenamos cientos de permisos
     * redundantes para el owner.
     */
    if (
      user.role ===
      'owner'
    ) {
      return actor;
    }

    const allowed =
      await controlPlane
        .authorization
        .hasUserActionPermission
        .execute({
          userId:
            user.id,

          actionKey:
            createActionKey(
              permission,
            ),

          target:
            createAccessPermissionTarget(
              permission,
            ),
        });

    if (!allowed) {
      await reply
        .code(403)
        .send({
          error:
            'authorization_denied',
        });

      return null;
    }

    return actor;
  };

  const requireActionRequestAccess =
  async (
    request:
      FastifyRequest,

    reply:
      FastifyReply,

    actionRequestId:
      ActionRequestId,
  ): Promise<
    ActorRef | null
  > => {
    const actor =
      await requireAuthenticatedActor(
        request,
        reply,
      );

    if (!actor) {
      return null;
    }

    if (
      actor.kind !==
      'user'
    ) {
      await reply
        .code(403)
        .send({
          error:
            'authorization_denied',
        });

      return null;
    }

    const user =
      await controlPlane
        .identity
        .getUser
        .execute(
          actor.id as UserId,
        );

    if (!user) {
      await reply
        .code(403)
        .send({
          error:
            'authorization_denied',
        });

      return null;
    }

    if (
      user.role ===
      'owner'
    ) {
      return actor;
    }

    const actionRequest =
      await controlPlane
        .actions
        .getActionRequest
        .execute(
          actionRequestId,
        );

    if (
      actionRequest
        .requestedBy
        .kind ===
        'user' &&
      actionRequest
        .requestedBy
        .id ===
        actor.id
    ) {
      return actor;
    }

    await reply
      .code(403)
      .send({
        error:
          'authorization_denied',
      });

    return null;
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

      if (
        error instanceof
        ActionExecutionNotFoundError
      ) {
        return reply
          .code(404)
          .send({
            error:
              'action_execution_not_found',
          });
      }

      if (
        error instanceof
        ActionRequestNotReadyForExecutionError
      ) {
        return reply
          .code(409)
          .send({
            error:
              'action_request_not_ready',
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

  app.get(
    '/api/nodes',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'app.system.access',
        );

    if (!actor) {
      return;
    }
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
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'app.system.access',
        );

      if (!actor) {
        return;
      }

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
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'app.system.access',
        );

      if (!actor) {
        return;
      }

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

  app.get(
    '/api/services',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'app.system.access',
        );

      if (!actor) {
        return;
      }

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
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'app.system.access',
        );

      if (!actor) {
        return;
      }

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

  app.get(
    '/api/service-instances/:id/observed-state',

    async (
      request,
      reply,
    ) => {
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'app.system.access',
        );

      if (!actor) {
        return;
      }

      const parsed =
        serviceInstanceParamsSchema.safeParse(
          request.params,
        );

      if (!parsed.success) {
        return reply
          .code(400)
          .send({
            error:
              'invalid_request',

            details:
              parsed.error.issues,
          });
      }

      const state =
        await controlPlane.infra
          .getServiceInstanceObservedState
          .execute(
            parsed.data
              .id as ServiceInstanceId,
          );

      const response:
        ServiceInstanceObservedStateResponse =
        {
          serviceInstanceId:
            parsed.data.id,

          collectedAt:
            state?.collectedAt
              .toISOString() ??
            null,

          runtimeSnapshot:
            state?.runtimeSnapshot ??
            null,
        };

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
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireOwnerActor(
          request,
          reply,
        );

      if (!actor) {
        return;
      }

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

      const actor =
        await requireActionRequestAccess(
          request,
          reply,
          parsed.data
            .id as ActionRequestId,
        );

      if (!actor) {
        return;
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

      const actor =
        await requireActionRequestAccess(
          request,
          reply,
          parsed.data
            .id as ActionRequestId,
        );

      if (!actor) {
        return;
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

  app.get(
    '/api/access/me',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireAuthenticatedActor(
          request,
          reply,
        );

      if (
        !actor ||
        actor.kind !==
          'user'
      ) {
        return;
      }

      const user =
        await controlPlane
          .identity
          .getUser
          .execute(
            actor.id as
              UserId,
          );

      if (!user) {
        return reply
          .code(403)
          .send({
            error:
              'authorization_denied',
          });
      }

      if (
        user.role ===
        'owner'
      ) {
        const response:
          AccessProfileResponse =
          {
            userId:
              user.id,

            role:
              user.role,

            permissions: [
              ...accessPermissionKeys,
            ],
          };

        return response;
      }

      const stored =
        await controlPlane
          .authorization
          .listUserActionPermissions
          .execute(
            user.id,
          );

      const allowedKeys =
        new Set<
          AccessPermissionKey
        >();

      for (
        const permission of
          stored
      ) {
        const parsed =
          accessPermissionKeySchema
            .safeParse(
              permission.actionKey,
            );

        if (
          !parsed.success
        ) {
          continue;
        }

        const expectedTarget =
          createAccessPermissionTarget(
            parsed.data,
          );

        if (
          permission.target.kind ===
            expectedTarget.kind &&
          permission.target.id ===
            expectedTarget.id
        ) {
          allowedKeys.add(
            parsed.data,
          );
        }
      }

      const response:
        AccessProfileResponse =
        {
          userId:
            user.id,

          role:
            user.role,

          permissions:
            accessPermissionKeys
              .filter(
                (
                  permission,
                ) =>
                  allowedKeys.has(
                    permission,
                  ),
              ),
        };

      return response;
    },
  );

  app.get(
    '/api/family/users',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'app.family.access',
        );

      if (!actor) {
        return;
      }

      const users =
        await controlPlane
          .identity
          .listUsers
          .execute();

      const response:
        FamilyUserResponse[] =
        users.map(
          (user) => ({
            id:
              user.id,

            name:
              user.name,

            role:
              user.role,

            createdAt:
              user.createdAt
                .toISOString(),
          }),
        );

      return response;
    },
  );

  app.post(
    '/api/family/users',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'family.users.create',
        );

      if (!actor) {
        return;
      }

      if (!familyAuthProvisioner) {
        return reply
          .code(503)
          .send({
            error:
              'family_user_provisioning_unavailable',
          });
      }

      const body =
        createFamilyUserRequestSchema
          .safeParse(
            request.body,
          );

      if (!body.success) {
        return reply
          .code(400)
          .send({
            error:
              'invalid_request',
          });
      }

      const email =
        body.data.email
          .trim()
          .toLowerCase();

      let authUser:
        {
          user: {
            id:
              string;

            name:
              string;

            email:
              string;
          };
        };

      try {
        const createdAuthUser =
          await familyAuthProvisioner
            .createUser({
              email,

              password:
                body.data
                  .password,

              name:
                body.data
                  .name,
            });

        authUser = {
          user: {
            id:
              createdAuthUser.id,

            name:
              createdAuthUser.name,

            email:
              createdAuthUser.email,
          },
        };

      } catch (error) {
        request.log.warn(
          {
            error,
            email,
          },
          'Failed to create family authentication user',
        );

        return reply
          .code(409)
          .send({
            error:
              'family_user_auth_creation_failed',
          });
      }

      try {
        const user =
          await controlPlane
            .identity
            .createFamilyUser
            .execute({
              id:
                authUser
                  .user
                  .id,

              name:
                body.data
                  .name,

              role:
                body.data
                  .role,
            });

        const response:
          FamilyUserResponse =
          {
            id:
              user.id,

            name:
              user.name,

            role:
              user.role,

            createdAt:
              user.createdAt
                .toISOString(),
          };

        return reply
          .code(201)
          .send(
            response,
          );
      } catch (error) {
        request.log.error(
          {
            error,

            authUserId:
              authUser
                .user
                .id,
          },
          'Failed to create family identity user',
        );

        try {
          await familyAuthProvisioner
          .removeUser({
            userId:
              authUser
                .user
                .id,

            headers:
              fromNodeHeaders(
                request.headers,
              ),
          });

        } catch (
          rollbackError
        ) {
          request.log.error(
            {
              rollbackError,

              authUserId:
                authUser
                  .user
                  .id,
            },
            'Failed to rollback family authentication user',
          );
        }

        return reply
          .code(500)
          .send({
            error:
              'family_user_creation_failed',
          });
      }
    },
  );

  app.get(
    '/api/family/users/:id/access',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireOwnerActor(
          request,
          reply,
        );

      if (!actor) {
        return;
      }

      const params =
        familyUserParamsSchema
          .safeParse(
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

      const user =
        await controlPlane
          .identity
          .getUser
          .execute(
            params.data.id as
              UserId,
          );

      if (!user) {
        return reply
          .code(404)
          .send({
            error:
              'family_user_not_found',
          });
      }

      if (
        user.role ===
        'owner'
      ) {
        const response:
          AccessProfileResponse =
          {
            userId:
              user.id,

            role:
              user.role,

            permissions: [
              ...accessPermissionKeys,
            ],
          };

        return response;
      }

      const stored =
        await controlPlane
          .authorization
          .listUserActionPermissions
          .execute(
            user.id,
          );

      const allowedKeys =
        new Set<
          AccessPermissionKey
        >();

      for (
        const permission of
          stored
      ) {
        const parsed =
          accessPermissionKeySchema
            .safeParse(
              permission.actionKey,
            );

        if (
          !parsed.success
        ) {
          continue;
        }

        const target =
          createAccessPermissionTarget(
            parsed.data,
          );

        if (
          permission.target.kind ===
            target.kind &&
          permission.target.id ===
            target.id
        ) {
          allowedKeys.add(
            parsed.data,
          );
        }
      }

      const response:
        AccessProfileResponse =
        {
          userId:
            user.id,

          role:
            user.role,

          permissions:
            accessPermissionKeys
              .filter(
                (
                  permission,
                ) =>
                  allowedKeys.has(
                    permission,
                  ),
              ),
        };

      return response;
    },
  );

  app.patch(
    '/api/family/users/:id/access',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireOwnerActor(
          request,
          reply,
        );

      if (
        !actor ||
        actor.kind !==
          'user'
      ) {
        return;
      }

      const params =
        familyUserParamsSchema
          .safeParse(
            request.params,
          );

      const body =
        setAccessPermissionRequestSchema
          .safeParse(
            request.body,
          );

      if (
        !params.success ||
        !body.success
      ) {
        return reply
          .code(400)
          .send({
            error:
              'invalid_request',
          });
      }

      const user =
        await controlPlane
          .identity
          .getUser
          .execute(
            params.data.id as
              UserId,
          );

      if (!user) {
        return reply
          .code(404)
          .send({
            error:
              'family_user_not_found',
          });
      }

      if (
        user.role ===
        'owner'
      ) {
        return reply
          .code(409)
          .send({
            error:
              'owner_permissions_are_implicit',
          });
      }

      const permissionKey =
        body.data.permission;

      const target =
        createAccessPermissionTarget(
          permissionKey,
        );

      if (
        body.data.enabled
      ) {
        await controlPlane
          .authorization
          .grantUserActionPermission
          .execute({
            userId:
              user.id,

            actionKey:
              permissionKey,

            target,

            grantedByUserId:
              actor.id as
                UserId,
          });
      } else {
        const current =
          await controlPlane
            .authorization
            .listUserActionPermissions
            .execute(
              user.id,
            );

        const matching =
          current.find(
            (
              permission,
            ) =>
              permission
                .actionKey ===
                permissionKey &&
              permission
                .target
                .kind ===
                target.kind &&
              permission
                .target
                .id ===
                target.id,
          );

        if (matching) {
          await controlPlane
            .authorization
            .revokeUserActionPermission
            .execute({
              permissionId:
                matching.id,

              userId:
                user.id,
            });
        }
      }

      return {
        success:
          true,
      };
    },
  );

  app.patch(
    '/api/family/users/:id/role',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'family.users.manage',
        );

      if (!actor) {
        return;
      }

      const params =
        familyUserParamsSchema
          .safeParse(
            request.params,
          );

      const body =
        updateFamilyUserRoleRequestSchema
          .safeParse(
            request.body,
          );

      if (
        !params.success ||
        !body.success
      ) {
        return reply
          .code(400)
          .send({
            error:
              'invalid_request',
          });
      }

      try {
        const user =
          await controlPlane
            .identity
            .changeFamilyUserRole
            .execute({
              userId:
                params.data.id as UserId,

              role:
                body.data.role,
            });

        const response:
          FamilyUserResponse =
          {
            id:
              user.id,

            name:
              user.name,

            role:
              user.role,

            createdAt:
              user.createdAt
                .toISOString(),
          };

        return response;
      } catch (
        error
      ) {
        if (
          error instanceof Error &&
          error.message ===
            'owner_cannot_be_modified'
        ) {
          return reply
            .code(409)
            .send({
              error:
                'owner_cannot_be_modified',
            });
        }

        return reply
          .code(404)
          .send({
            error:
              'family_user_not_found',
          });
      }
    },
  );

  app.post(
    '/api/family/users/:id/password',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'family.users.manage',
        );

      if (!actor) {
        return;
      }

      if (!familyAuthProvisioner) {
        return reply
          .code(503)
          .send({
            error:
              'family_user_provisioning_unavailable',
          });
      }

      const params =
        familyUserParamsSchema
          .safeParse(
            request.params,
          );

      const body =
        resetFamilyUserPasswordRequestSchema
          .safeParse(
            request.body,
          );

      if (
        !params.success ||
        !body.success
      ) {
        return reply
          .code(400)
          .send({
            error:
              'invalid_request',
          });
      }

      const user =
        await controlPlane
          .identity
          .getUser
          .execute(
            params.data.id as UserId,
          );

      if (!user) {
        return reply
          .code(404)
          .send({
            error:
              'family_user_not_found',
          });
      }

      if (
        user.role ===
        'owner'
      ) {
        return reply
          .code(409)
          .send({
            error:
              'owner_password_managed_separately',
          });
      }

      await familyAuthProvisioner
        .setPassword({
          userId:
            user.id,

          newPassword:
            body.data.password,

          headers:
            fromNodeHeaders(
              request.headers,
            ),
        });

      /*
      * A password reset invalidates existing
      * access as a defensive default.
      */
      await familyAuthProvisioner
        .revokeSessions({
          userId:
            user.id,

          headers:
            fromNodeHeaders(
              request.headers,
            ),
        });

      return {
        success:
          true,
      };
    },
  );

  app.post(
    '/api/family/users/:id/revoke-sessions',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'family.users.manage',
        );

      if (!actor) {
        return;
      }

      if (!familyAuthProvisioner) {
        return reply
          .code(503)
          .send({
            error:
              'family_user_provisioning_unavailable',
          });
      }

      const params =
        familyUserParamsSchema
          .safeParse(
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

      const user =
        await controlPlane
          .identity
          .getUser
          .execute(
            params.data.id as UserId,
          );

      if (!user) {
        return reply
          .code(404)
          .send({
            error:
              'family_user_not_found',
          });
      }

      if (
        user.role ===
        'owner'
      ) {
        return reply
          .code(409)
          .send({
            error:
              'owner_sessions_managed_separately',
          });
      }

      await familyAuthProvisioner
        .revokeSessions({
          userId:
            user.id,

          headers:
            fromNodeHeaders(
              request.headers,
            ),
        });

      return {
        success:
          true,
      };
    },
  );

  app.delete(
    '/api/family/users/:id',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireAccessPermission(
          request,
          reply,
          'family.users.manage',
        );

      if (!actor) {
        return;
      }

      if (!familyAuthProvisioner) {
        return reply
          .code(503)
          .send({
            error:
              'family_user_provisioning_unavailable',
          });
      }

      const params =
        familyUserParamsSchema
          .safeParse(
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

      const user =
        await controlPlane
          .identity
          .getUser
          .execute(
            params.data.id as UserId,
          );

      if (!user) {
        return reply
          .code(404)
          .send({
            error:
              'family_user_not_found',
          });
      }

      if (
        user.role ===
        'owner'
      ) {
        return reply
          .code(409)
          .send({
            error:
              'owner_cannot_be_deleted',
          });
      }

      /*
      * Primero quitamos la identidad DKTURBO.
      *
      * Incluso si el cleanup posterior de
      * Better Auth fallase, el usuario ya no
      * tendría autorización en Control Plane.
      */
      await controlPlane
        .identity
        .deleteFamilyUser
        .execute(
          user.id,
        );

      try {
        await familyAuthProvisioner
          .removeUser({
            userId:
              user.id,

            headers:
              fromNodeHeaders(
                request.headers,
              ),
          });
      } catch (
        error
      ) {
        request.log.error(
          {
            error,
            userId:
              user.id,
          },
          'Family auth cleanup failed after identity removal',
        );

        return reply
          .code(500)
          .send({
            error:
              'family_user_auth_cleanup_failed',
          });
      }

      return reply
        .code(204)
        .send();
    },
  );

  app.get(
    '/api/approval-requests/pending',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireOwnerActor(
          request,
          reply,
        );

      if (!actor) {
        return;
      }

      const [
        approvals,
        actionRequests,
      ] =
        await Promise.all([
          controlPlane
            .authorization
            .listPendingApprovalRequests
            .execute(),

          controlPlane
            .actions
            .listActionRequests
            .execute(),
        ]);

      const requestsById =
        new Map(
          actionRequests.map(
            (
              actionRequest,
            ) => [
              actionRequest.id,
              actionRequest,
            ],
          ),
        );

      const response:
        PendingApprovalResponse[] =
        [];

      for (
        const approval of
          approvals
      ) {
        const actionRequest =
          requestsById.get(
            approval.actionRequestId,
          );

        if (
          !actionRequest
        ) {
          continue;
        }

        response.push({
          id:
            approval.id,

          actionRequestId:
            approval.actionRequestId,

          requestedAt:
            approval.requestedAt
              .toISOString(),

          requestedBy:
            actionRequest
              .requestedBy,

          actionKey:
            actionRequest
              .actionKey,

          target:
            actionRequest
              .target,
        });
      }

      return response;
    },
  );

  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',

    async handler(request, reply) {
      if (
        request.url.startsWith(
          '/api/auth/admin/',
        )
      ) {
        return reply
          .code(404)
          .send({
            error:
              'not_found',
          });
      }

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

      const existingExecution =
        await controlPlane
          .actions
          .getActionExecution
          .execute(
            params.data
              .id as
              ActionExecutionId,
          );

      const actor =
        await requireActionRequestAccess(
          request,
          reply,
          existingExecution
            .actionRequestId,
        );

      if (!actor) {
        return;
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

  app.get(
    '/api/family/users/:id/permissions',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireOwnerActor(
          request,
          reply,
        );

      if (!actor) {
        return;
      }

      const params =
        familyUserParamsSchema
          .safeParse(
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

      const user =
        await controlPlane
          .identity
          .getUser
          .execute(
            params.data.id as UserId,
          );

      if (!user) {
        return reply
          .code(404)
          .send({
            error:
              'family_user_not_found',
          });
      }

      const permissions =
        await controlPlane
          .authorization
          .listUserActionPermissions
          .execute(
            user.id,
          );

      const response:
        FamilyPermissionResponse[] =
        permissions.map(
          (permission) => ({
            id:
              permission.id,

            userId:
              permission.userId,

            actionKey:
              permission.actionKey,

            target: {
              kind:
                permission.target.kind,

              id:
                permission.target.id,
            },

            grantedByUserId:
              permission.grantedByUserId,

            grantedAt:
              permission.grantedAt
                .toISOString(),
          }),
        );

      return response;
    },
  );

  app.post(
    '/api/family/users/:id/permissions',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireOwnerActor(
          request,
          reply,
        );

      if (!actor) {
        return;
      }

      const params =
        familyUserParamsSchema
          .safeParse(
            request.params,
          );

      const body =
        grantFamilyPermissionRequestSchema
          .safeParse(
            request.body,
          );

      if (
        !params.success ||
        !body.success
      ) {
        return reply
          .code(400)
          .send({
            error:
              'invalid_request',
          });
      }

      const user =
        await controlPlane
          .identity
          .getUser
          .execute(
            params.data.id as UserId,
          );

      if (!user) {
        return reply
          .code(404)
          .send({
            error:
              'family_user_not_found',
          });
      }

      if (
        user.role ===
        'owner'
      ) {
        return reply
          .code(409)
          .send({
            error:
              'owner_permissions_not_managed_here',
          });
      }

      const permission =
        await controlPlane
          .authorization
          .grantUserActionPermission
          .execute({
            userId:
              user.id,

            actionKey:
              body.data.actionKey,

            target:
              body.data.target,

            grantedByUserId:
              actor.id as UserId,
          });

      const response:
        FamilyPermissionResponse =
        {
          id:
            permission.id,

          userId:
            permission.userId,

          actionKey:
            permission.actionKey,

          target: {
            kind:
              permission.target.kind,

            id:
              permission.target.id,
          },

          grantedByUserId:
            permission.grantedByUserId,

          grantedAt:
            permission.grantedAt
              .toISOString(),
        };

      return reply
        .code(201)
        .send(
          response,
        );
    },
  );

  app.delete(
    '/api/family/users/:id/permissions/:permissionId',
    async (
      request,
      reply,
    ) => {
      const actor =
        await requireOwnerActor(
          request,
          reply,
        );

      if (!actor) {
        return;
      }

      const params =
        familyPermissionParamsSchema
          .safeParse(
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

      const user =
        await controlPlane
          .identity
          .getUser
          .execute(
            params.data.id as UserId,
          );

      if (!user) {
        return reply
          .code(404)
          .send({
            error:
              'family_user_not_found',
          });
      }

      if (
        user.role ===
        'owner'
      ) {
        return reply
          .code(409)
          .send({
            error:
              'owner_permissions_not_managed_here',
          });
      }

      const deleted =
        await controlPlane
          .authorization
          .revokeUserActionPermission
          .execute({
            permissionId:
              params.data
                .permissionId as
                UserActionPermissionId,

            userId:
              user.id,
          });

      if (!deleted) {
        return reply
          .code(404)
          .send({
            error:
              'family_permission_not_found',
          });
      }

      return reply
        .code(204)
        .send();
    },
  );

  return app;
};
