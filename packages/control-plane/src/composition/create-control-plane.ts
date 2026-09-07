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
import { ListServices } from '../modules/infra/application/list-services.js';
import { RegisterService } from '../modules/infra/application/register-service.js';
import { PostgresServiceRepository } from '../modules/infra/adapters/persistence/postgres-service.repository.js';
import { ListServiceInstances } from '../modules/infra/application/list-service-instances.js';
import { RegisterServiceInstance } from '../modules/infra/application/register-service-instance.js';
import { PostgresServiceInstanceRepository } from '../modules/infra/adapters/persistence/postgres-service-instance.repository.js';
import { ListActionRequests } from '../core/actions/application/list-action-requests.js';
import { RequestAction } from '../core/actions/application/request-action.js';
import { PostgresActionRequestRepository } from '../core/actions/adapters/persistence/postgres-action-request.repository.js';
import { AuthorizeActionRequest } from '../core/authorization/application/authorize-action-request.js';
import { RoleBasedActionAuthorizer } from '../core/authorization/adapters/role-based-action-authorizer.js';
import { BootstrapOwner } from '../core/identity/application/bootstrap-owner.js';
import { PostgresUserRepository } from '../core/identity/adapters/persistence/postgres-user.repository.js';
import { PostgresActionExecutionRepository } from '../core/actions/adapters/persistence/postgres-action-execution.repository.js';
import { PrepareActionExecution } from '../core/actions/application/prepare-action-execution.js';
import { ProcessActionRequest } from '../core/actions/application/process-action-request.js';

import { PostgresApprovalRequestRepository } from '../core/authorization/adapters/postgres-approval-request.repository.js';
import { DecideApprovalRequest } from '../core/authorization/application/decide-approval-request.js';

import { InfraActionCapabilityChecker } from '../modules/infra/adapters/infra-action-capability-checker.js';
import { InfraActionTargetResolver } from '../modules/infra/adapters/infra-action-target-resolver.js';
import {
  ExecuteActionExecution,
} from '../core/actions/application/execute-action-execution.js';
import {
  SshActionExecutionGateway,
} from '../infrastructure/execution/ssh-action-execution.gateway.js';
import { PostgresNodeAccessEndpointRepository, } from '../modules/infra/adapters/persistence/postgres-node-access-endpoint.repository.js';
import {
  RefreshNodeObservedState,
} from '../modules/infra/application/refresh-node-observed-state.js';
import {
  SshNodeRuntimeSnapshotCollector,
} from '../modules/infra/adapters/ssh-node-runtime-snapshot.collector.js';
import {
  SshNodeOperations,
} from '../infrastructure/ssh/ssh-node-operations.js';
import {
  PostgresServiceRuntimeBindingRepository,
} from '../modules/infra/adapters/persistence/postgres-service-runtime-binding.repository.js';
import {
  PostgresServiceInstanceObservedStateRepository,
} from '../modules/infra/adapters/persistence/postgres-service-instance-observed-state.repository.js';
import {
  SshServiceInstanceRuntimeSnapshotCollector,
} from '../modules/infra/adapters/ssh-service-instance-runtime-snapshot.collector.js';
import {
  SetServiceRuntimeBinding,
} from '../modules/infra/application/set-service-runtime-binding.js';
import {
  ListServiceRuntimeBindings,
} from '../modules/infra/application/list-service-runtime-bindings.js';
import {
  GetServiceInstanceObservedState,
} from '../modules/infra/application/get-service-instance-observed-state.js';
import {
  RefreshServiceInstanceObservedState,
} from '../modules/infra/application/refresh-service-instance-observed-state.js';
import {
  PostgresUserActionPermissionRepository,
} from '../core/authorization/adapters/postgres-user-action-permission.repository.js';
import {
  ListUsers,
} from '../core/identity/application/list-users.js';
import {
  ListPendingApprovalRequests,
} from '../core/authorization/application/list-pending-approval-requests.js';
import {
  GetUser,
} from '../core/identity/application/get-user.js';
import {
  GetActionRequest,
} from '../core/actions/application/get-action-request.js';
import {
  GetActionExecution,
} from '../core/actions/application/get-action-execution.js';
import {
  CreateFamilyUser,
} from '../core/identity/application/create-family-user.js';
import {
  ChangeFamilyUserRole,
} from '../core/identity/application/change-family-user-role.js';
import {
  DeleteFamilyUser,
} from '../core/identity/application/delete-family-user.js';
import {
  ListUserActionPermissions,
} from '../core/authorization/application/list-user-action-permissions.js';
import {
  GrantUserActionPermission,
} from '../core/authorization/application/grant-user-action-permission.js';
import {
  RevokeUserActionPermission,
} from '../core/authorization/application/revoke-user-action-permission.js';
import {
  HasUserActionPermission,
} from '../core/authorization/application/has-user-action-permission.js';

export interface CreateControlPlaneOptions {
  database: Kysely<Database>;
}

export const createControlPlane = ({
  database,
}: CreateControlPlaneOptions) => {
  const nodeRepository = new PostgresNodeRepository(database);
  const nodeObservedStateRepository = new PostgresNodeObservedStateRepository(database);
  const clock = new SystemClock();
  const nodeCapabilityRepository = new PostgresNodeCapabilityRepository(database);
  const serviceRepository = new PostgresServiceRepository(database);
  const serviceInstanceRepository = new PostgresServiceInstanceRepository(database);
  const serviceRuntimeBindingRepository = new PostgresServiceRuntimeBindingRepository(
    database,
  );
  const serviceInstanceObservedStateRepository = new PostgresServiceInstanceObservedStateRepository(
    database,
  );
  const actionRequestRepository = new PostgresActionRequestRepository(database);
  const userRepository = new PostgresUserRepository(database);
  const userActionPermissionRepository = new PostgresUserActionPermissionRepository(
    database,
  );
  const actionAuthorizer = new RoleBasedActionAuthorizer(
    userRepository,
    userActionPermissionRepository,
  );
  const approvalRequestRepository = new PostgresApprovalRequestRepository(
    database,
  );
  const actionExecutionRepository = new PostgresActionExecutionRepository(
    database,
  );
  const nodeAccessEndpointRepository = new PostgresNodeAccessEndpointRepository(
    database,
  );
  const sshNodeOperations = new SshNodeOperations();
  const runtimeSnapshotCollector = new SshNodeRuntimeSnapshotCollector(
    nodeAccessEndpointRepository,
    sshNodeOperations,
  );
  const serviceInstanceRuntimeSnapshotCollector = new SshServiceInstanceRuntimeSnapshotCollector(
    serviceRuntimeBindingRepository,
    nodeAccessEndpointRepository,
    sshNodeOperations,
  );
  const actionExecutionGateway = new SshActionExecutionGateway(
    nodeAccessEndpointRepository,
    serviceRuntimeBindingRepository,
    sshNodeOperations,
  );
  const executeActionExecution = new ExecuteActionExecution(
    actionExecutionRepository,
    actionRequestRepository,
    actionExecutionGateway,
    clock,
  );
  const actionTargetResolver = new InfraActionTargetResolver(
    nodeRepository,
    serviceInstanceRepository,
  );
  const actionCapabilityChecker = new InfraActionCapabilityChecker(
    nodeCapabilityRepository,
  );
  const prepareActionExecution = new PrepareActionExecution(
    actionTargetResolver,
    actionCapabilityChecker,
    actionExecutionRepository,
    clock,
  );
  const refreshNodeObservedState = new RefreshNodeObservedState(
    nodeRepository,
    nodeObservedStateRepository,
    runtimeSnapshotCollector,
    clock,
  );
  const refreshServiceInstanceObservedState = new RefreshServiceInstanceObservedState(
    serviceInstanceRepository,
    serviceInstanceObservedStateRepository,
    serviceInstanceRuntimeSnapshotCollector,
    clock,
  );


  return {
    actions: {
      requestAction: new RequestAction(
        actionRequestRepository,
        clock,
      ),
      listActionRequests: new ListActionRequests(
        actionRequestRepository,
      ),
      processActionRequest: new ProcessActionRequest(
        actionRequestRepository,
        actionAuthorizer,
        approvalRequestRepository,
        prepareActionExecution,
        clock,
      ),
      executeActionExecution,
      getActionRequest: new GetActionRequest(
        actionRequestRepository,
      ),
      getActionExecution: new GetActionExecution(
        actionExecutionRepository,
      ),
    },

    authorization: {
      authorizeActionRequest:
        new AuthorizeActionRequest(
          actionRequestRepository,
          actionAuthorizer,
        ),

      decideApprovalRequest:
        new DecideApprovalRequest(
          approvalRequestRepository,
          actionRequestRepository,
          userRepository,
          userActionPermissionRepository,
          prepareActionExecution,
          clock,
        ),

      listPendingApprovalRequests:
        new ListPendingApprovalRequests(
          approvalRequestRepository,
        ),

      listUserActionPermissions:
        new ListUserActionPermissions(
          userActionPermissionRepository,
        ),

      grantUserActionPermission:
        new GrantUserActionPermission(
          userActionPermissionRepository,
          clock,
        ),

      revokeUserActionPermission:
        new RevokeUserActionPermission(
          userActionPermissionRepository,
        ),

      hasUserActionPermission:
        new HasUserActionPermission(
          userActionPermissionRepository,
        ),
    },

    identity: {
      bootstrapOwner:
        new BootstrapOwner(
          userRepository,
          clock,
        ),

      getUser:
        new GetUser(
          userRepository,
        ),

      listUsers:
        new ListUsers(
          userRepository,
        ),

      createFamilyUser:
        new CreateFamilyUser(
          userRepository,
          clock,
        ),

      changeFamilyUserRole:
        new ChangeFamilyUserRole(
          userRepository,
        ),

      deleteFamilyUser:
        new DeleteFamilyUser(
          userRepository,
        ),
    },

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
      registerService: new RegisterService(
        serviceRepository,
        clock,
      ),
      listServices: new ListServices(
        serviceRepository,
      ),
      registerServiceInstance: new RegisterServiceInstance(
        nodeRepository,
        serviceRepository,
        serviceInstanceRepository,
        clock,
      ),
      listServiceInstances: new ListServiceInstances(
        serviceInstanceRepository,
      ),
      setServiceRuntimeBinding: new SetServiceRuntimeBinding(
        serviceInstanceRepository,
        serviceRuntimeBindingRepository,
        clock,
      ),
      listServiceRuntimeBindings: new ListServiceRuntimeBindings(
        serviceRuntimeBindingRepository,
      ),
      getServiceInstanceObservedState: new GetServiceInstanceObservedState(
        serviceInstanceRepository,
        serviceInstanceObservedStateRepository,
      ),
      refreshServiceInstanceObservedState,
      refreshNodeObservedState,
    },
  };
};

export type ControlPlane = ReturnType<typeof createControlPlane>;

