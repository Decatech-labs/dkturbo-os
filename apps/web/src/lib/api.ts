import type {
  NodeObservedStateResponse,
  NodeResponse,
  NodeStatusResponse,
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
