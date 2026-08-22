import {
  config as loadDotenv,
} from 'dotenv';

import {
  createControlPlane,
  createDatabase,
} from '@dkturbo/control-plane';

const main = async (): Promise<void> => {
  loadDotenv({
    path: '.env.local',
  });

  const connectionString =
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is required',
    );
  }

  const database =
    createDatabase({
      connectionString,
    });

  const controlPlane =
    createControlPlane({
      database,
    });

  const desiredBindings = [
    {
      instanceKey:
        'openbrass-home-prod',

      runtimeKind:
        'docker' as const,

      resourceName:
        'openbrass-app',
    },

    {
      instanceKey:
        'postgresql-home-prod',

      runtimeKind:
        'docker' as const,

      resourceName:
        'openbrass-db',
    },
  ];

  try {
    const instances =
      await controlPlane.infra
        .listServiceInstances
        .execute();

    for (
      const desired of
        desiredBindings
    ) {
      const instance =
        instances.find(
          (candidate) =>
            candidate.key ===
            desired.instanceKey,
        );

      if (!instance) {
        throw new Error(
          `Service instance not found: ${desired.instanceKey}`,
        );
      }

      const binding =
        await controlPlane.infra
          .setServiceRuntimeBinding
          .execute({
            serviceInstanceId:
              instance.id,

            runtimeKind:
              desired.runtimeKind,

            resourceName:
              desired.resourceName,
          });

      console.info(
        'Runtime binding configured',
        {
          instanceKey:
            desired.instanceKey,

          serviceInstanceId:
            binding.serviceInstanceId,

          runtimeKind:
            binding.runtimeKind,

          resourceName:
            binding.resourceName,
        },
      );
    }
  } finally {
    await database.destroy();
  }
};

main().catch((error) => {
  console.error(
    'Failed to configure service runtime bindings',
    error,
  );

  process.exitCode = 1;
});
