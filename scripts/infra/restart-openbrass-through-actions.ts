import {
  config as loadDotenv,
} from 'dotenv';

import {
  createActorRef,
  createControlPlane,
  createDatabase,
  createResourceRef,
} from '@dkturbo/control-plane';

const main = async (): Promise<void> => {
  loadDotenv({
    path: '.env.local',
  });

  const connectionString =
    process.env.DATABASE_URL;

  const ownerId =
    process.env.BOOTSTRAP_OWNER_ID;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is required',
    );
  }

  if (!ownerId) {
    throw new Error(
      'BOOTSTRAP_OWNER_ID is required',
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

  try {
    const instances =
      await controlPlane.infra
        .listServiceInstances
        .execute();

    const instance =
      instances.find(
        (candidate) =>
          candidate.key ===
          'openbrass-home-prod',
      );

    if (!instance) {
      throw new Error(
        'openbrass-home-prod not found',
      );
    }

    console.info(
      'Target resolved',
      {
        serviceInstanceId:
          instance.id,

        serviceInstanceKey:
          instance.key,

        nodeId:
          instance.nodeId,
      },
    );

    const request =
      await controlPlane.actions
        .requestAction
        .execute({
          actionKey:
            'service.restart',

          target:
            createResourceRef({
              kind:
                'infra.service-instance',

              id:
                instance.id,
            }),

          requestedBy:
            createActorRef({
              kind: 'user',
              id: ownerId,
            }),

          parameters: {},
        });

    console.info(
      'Action requested',
      {
        actionRequestId:
          request.id,

        status:
          request.status,

        actionKey:
          request.actionKey,
      },
    );

    const processed =
      await controlPlane.actions
        .processActionRequest
        .execute(
          request.id,
        );

    console.info(
      'Action processed',
      {
        outcome:
          processed.outcome,
      },
    );

    if (
      processed.outcome !==
      'READY'
    ) {
      throw new Error(
        `Expected READY, received ${processed.outcome}`,
      );
    }

    console.info(
      'Execution prepared',
      {
        executionId:
          processed.execution.id,

        nodeId:
          processed.execution.nodeId,

        requiredCapability:
          processed.execution
            .requiredCapability,
      },
    );

    const execution =
      await controlPlane.actions
        .executeActionExecution
        .execute(
          processed.execution.id,
        );

    console.info(
      'Execution completed',
      {
        executionId:
          execution.id,

        status:
          execution.status,

        result:
          execution.result,

        errorCode:
          execution.errorCode,

        errorMessage:
          execution.errorMessage,
      },
    );

    if (
      execution.status !==
      'SUCCEEDED'
    ) {
      throw new Error(
        `Execution finished with ${execution.status}: ${execution.errorMessage ?? 'unknown error'}`,
      );
    }
  } finally {
    await database.destroy();
  }
};

main().catch((error) => {
  console.error(
    'Restart test failed',
    error,
  );

  process.exitCode = 1;
});
