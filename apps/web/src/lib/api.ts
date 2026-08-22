import type {
  NodeObservedStateResponse,
  NodeResponse,
  NodeStatusResponse,
  ServiceInstanceResponse,
  ServiceResponse,
  ServiceInstanceObservedStateResponse,
} from '@dkturbo/contracts';

const API_BASE_URL =
  process.env.DKTURBO_API_URL ??
  'http://127.0.0.1:3001';

export interface NodeDashboardData {
  node: NodeResponse;
  status: NodeStatusResponse;
  observedState:
    NodeObservedStateResponse;
}

export interface ServiceInstanceDashboardData {
  instance:
    ServiceInstanceResponse;

  node:
    NodeResponse | null;

  observedState:
    ServiceInstanceObservedStateResponse;
}

export interface ServiceDashboardData {
  service:
    ServiceResponse;

  instances:
    ServiceInstanceDashboardData[];
}

class DkturboApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(
      `DKTURBO API request failed: ${status} ${path}`,
    );
  }
}

const getJson = async <T>(
  path: string,
): Promise<T> => {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new DkturboApiError(
      response.status,
      path,
    );
  }

  return response.json() as Promise<T>;
};

export const getNodesDashboard =
  async (): Promise<
    NodeDashboardData[]
  > => {
    const nodes =
      await getJson<NodeResponse[]>(
        '/api/nodes',
      );

    return Promise.all(
      nodes.map(
        async (
          node,
        ): Promise<NodeDashboardData> => {
          const [
            status,
            observedState,
          ] = await Promise.all([
            getJson<NodeStatusResponse>(
              `/api/nodes/${node.id}/status`,
            ),

            getJson<NodeObservedStateResponse>(
              `/api/nodes/${node.id}/observed-state`,
            ),
          ]);

          return {
            node,
            status,
            observedState,
          };
        },
      ),
    );
  };

export const getServicesDashboard = async (
  nodes:
    readonly NodeResponse[],
): Promise<
  ServiceDashboardData[]
> => {
  const [
    services,
    instances,
  ] = await Promise.all([
    getJson<ServiceResponse[]>(
      '/api/services',
    ),

    getJson<
      ServiceInstanceResponse[]
    >(
      '/api/service-instances',
    ),
  ]);

  const nodesById =
    new Map(
      nodes.map(
        (node) => [
          node.id,
          node,
        ],
      ),
    );

  const instanceDashboardData =
    await Promise.all(
      instances.map(
        async (
          instance,
        ): Promise<
          ServiceInstanceDashboardData
        > => {
          const observedState =
            await getJson<
              ServiceInstanceObservedStateResponse
            >(
              `/api/service-instances/${instance.id}/observed-state`,
            );

          return {
            instance,

            node:
              nodesById.get(
                instance.nodeId,
              ) ?? null,

            observedState,
          };
        },
      ),
    );

  const instancesByServiceId =
    new Map<
      string,
      ServiceInstanceDashboardData[]
    >();

  for (
    const instanceData of
      instanceDashboardData
  ) {
    const serviceId =
      instanceData
        .instance
        .serviceId;

    const current =
      instancesByServiceId.get(
        serviceId,
      ) ?? [];

    current.push(
      instanceData,
    );

    instancesByServiceId.set(
      serviceId,
      current,
    );
  }

  return services.map(
    (service) => ({
      service,

      instances:
        instancesByServiceId.get(
          service.id,
        ) ?? [],
    }),
  );
};