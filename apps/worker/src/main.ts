import {
  fileURLToPath,
} from 'node:url';

import {
  config as loadDotenv,
} from 'dotenv';

import {
  createControlPlane,
  createDatabase,
} from '@dkturbo/control-plane';

const envFile = fileURLToPath(
  new URL(
    '../../../.env.local',
    import.meta.url,
  ),
);

loadDotenv({
  path: envFile,
});

const requireEnv = (
  name: string,
): string => {
  const value =
    process.env[name];

  if (!value) {
    throw new Error(
      `${name} is required`,
    );
  }

  return value;
};

const positiveIntegerEnv = (
  name: string,
  fallback: number,
): number => {
  const raw =
    process.env[name];

  if (!raw) {
    return fallback;
  }

  const value =
    Number(raw);

  if (
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(
      `${name} must be a positive integer`,
    );
  }

  return value;
};

const databaseUrl =
  requireEnv('DATABASE_URL');

const refreshIntervalMs =
  positiveIntegerEnv(
    'NODE_OBSERVED_STATE_REFRESH_INTERVAL_MS',
    30_000,
  );

const database =
  createDatabase({
    connectionString: databaseUrl,
  });

const controlPlane =
  createControlPlane({
    database,
  });

let stopping = false;

let timer:
  | ReturnType<
      typeof setTimeout
    >
  | undefined;

let activeCycle:
  | Promise<void>
  | null = null;

const refreshNodes =
  async (): Promise<void> => {
    const nodes =
      await controlPlane.infra
        .listNodes
        .execute();

    if (nodes.length === 0) {
      console.info(
        '[worker] No nodes registered',
      );

      return;
    }

    for (const node of nodes) {
      if (stopping) {
        return;
      }

      try {
        const state =
          await controlPlane.infra
            .refreshNodeObservedState
            .execute(
              node.id,
            );

        console.info(
          '[worker] Node refreshed',
          {
            nodeId:
              node.id,
            hostname:
              node.hostname,
            collectedAt:
              state
                .runtimeCollectedAt
                ?.toISOString() ??
              null,
          },
        );
      } catch (error) {
        console.error(
          '[worker] Node refresh failed',
          {
            nodeId:
              node.id,
            hostname:
              node.hostname,

            error:
              error instanceof Error
                ? error.message
                : String(
                    error,
                  ),
          },
        );
      }
    }
  };

const scheduleNext =
  (): void => {
    if (stopping) {
      return;
    }

    timer =
      setTimeout(
        () => {
          void runCycle();
        },
        refreshIntervalMs,
      );
  };

const runCycle =
  async (): Promise<void> => {
    if (stopping) {
      return;
    }

    const cycle =
      refreshNodes();

    activeCycle = cycle;

    try {
      await cycle;
    } catch (error) {
      console.error(
        '[worker] Refresh cycle failed',
        {
          error:
            error instanceof Error
              ? error.message
              : String(error),
        },
      );
    } finally {
      activeCycle = null;

      scheduleNext();
    }
  };

const shutdown =
  async (
    signal: string,
  ): Promise<void> => {
    if (stopping) {
      return;
    }

    stopping = true;

    console.info(
      `[worker] Received ${signal}, shutting down`,
    );

    if (timer) {
      clearTimeout(timer);
    }

    if (activeCycle) {
      await activeCycle;
    }

    await database.destroy();

    console.info(
      '[worker] Shutdown complete',
    );
  };

process.once(
  'SIGINT',
  () => {
    void shutdown(
      'SIGINT',
    );
  },
);

process.once(
  'SIGTERM',
  () => {
    void shutdown(
      'SIGTERM',
    );
  },
);

console.info(
  '[worker] DKTURBO Worker started',
  {
    refreshIntervalMs,
  },
);

await runCycle();
