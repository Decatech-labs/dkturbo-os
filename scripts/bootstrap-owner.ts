import {
  randomUUID,
} from 'node:crypto';

import {
  createControlPlane,
  createDatabase,
} from '../packages/control-plane/src/index.js';

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

const NODE = {
  name: 'Servidor de casa',
  hostname: 'dk-node-home-01',

  ssh: {
    label: 'Docker host gateway',
    host: 'host.docker.internal',
    port: 22,
    username: 'decatech-labs',
    priority: 10,
  },
} as const;

const SERVICES = [
  {
    key: 'dkturbo-web',
    name: 'DKTURBO Web',
    instanceKey:
      'dkturbo-web-prod',
    resourceName:
      'dkturbo-web',
  },
  {
    key: 'dkturbo-api',
    name: 'DKTURBO API',
    instanceKey:
      'dkturbo-api-prod',
    resourceName:
      'dkturbo-api',
  },
  {
    key: 'dkturbo-worker',
    name: 'DKTURBO Worker',
    instanceKey:
      'dkturbo-worker-prod',
    resourceName:
      'dkturbo-worker',
  },
  {
    key: 'dkturbo-postgres',
    name: 'PostgreSQL',
    instanceKey:
      'dkturbo-postgres-prod',
    resourceName:
      'dkturbo-db',
  },
  {
    key: 'dkturbo-caddy',
    name: 'Caddy',
    instanceKey:
      'dkturbo-caddy-prod',
    resourceName:
      'dkturbo-caddy',
  },
] as const;

const main =
  async (): Promise<void> => {
    const database =
      createDatabase({
        connectionString:
          requireEnv(
            'DATABASE_URL',
          ),
      });

    const controlPlane =
      createControlPlane({
        database,
      });

    try {
      /*
       * Node
       */

      const nodes =
        await controlPlane
          .infra
          .listNodes
          .execute();

      let node =
        nodes.find(
          (candidate) =>
            candidate.hostname ===
            NODE.hostname,
        );

      if (!node) {
        node =
          await controlPlane
            .infra
            .registerNode
            .execute({
              name:
                NODE.name,
              hostname:
                NODE.hostname,
            });

        console.log(
          `Node created: ${NODE.hostname}`,
        );
      } else {
        console.log(
          `Node already exists: ${NODE.hostname}`,
        );
      }

      /*
       * SSH access endpoint
       */

      const existingSshEndpoint =
        await database
          .selectFrom(
            'infra.node_access_endpoints',
          )
          .selectAll()
          .where(
            'node_id',
            '=',
            node.id,
          )
          .where(
            'transport',
            '=',
            'ssh',
          )
          .where(
            'host',
            '=',
            NODE.ssh.host,
          )
          .where(
            'port',
            '=',
            NODE.ssh.port,
          )
          .where(
            'username',
            '=',
            NODE.ssh.username,
          )
          .executeTakeFirst();

      if (existingSshEndpoint) {
        await database
          .updateTable(
            'infra.node_access_endpoints',
          )
          .set({
            label:
              NODE.ssh.label,
            priority:
              NODE.ssh.priority,
            enabled:
              true,
          })
          .where(
            'id',
            '=',
            existingSshEndpoint.id,
          )
          .execute();

        console.log(
          'SSH endpoint already exists.',
        );
      } else {
        await database
          .insertInto(
            'infra.node_access_endpoints',
          )
          .values({
            id:
              randomUUID(),
            node_id:
              node.id,
            transport:
              'ssh',
            label:
              NODE.ssh.label,
            host:
              NODE.ssh.host,
            port:
              NODE.ssh.port,
            username:
              NODE.ssh.username,
            priority:
              NODE.ssh.priority,
            enabled:
              true,
            created_at:
              new Date(),
          })
          .execute();

        console.log(
          'SSH endpoint created.',
        );
      }

      /*
       * Services + instances + Docker bindings
       */

      for (
        const definition of
          SERVICES
      ) {
        const services =
          await controlPlane
            .infra
            .listServices
            .execute();

        let service =
          services.find(
            (candidate) =>
              candidate.key ===
              definition.key,
          );

        if (!service) {
          service =
            await controlPlane
              .infra
              .registerService
              .execute({
                key:
                  definition.key,
                name:
                  definition.name,
              });

          console.log(
            `Service created: ${definition.key}`,
          );
        } else {
          console.log(
            `Service already exists: ${definition.key}`,
          );
        }

        const instances =
          await controlPlane
            .infra
            .listServiceInstances
            .execute();

        let instance =
          instances.find(
            (candidate) =>
              candidate.key ===
              definition.instanceKey,
          );

        if (!instance) {
          instance =
            await controlPlane
              .infra
              .registerServiceInstance
              .execute({
                key:
                  definition.instanceKey,
                serviceId:
                  service.id,
                nodeId:
                  node.id,
                environment:
                  'production',
              });

          console.log(
            `Instance created: ${definition.instanceKey}`,
          );
        } else {
          if (
            instance.serviceId !==
              service.id ||
            instance.nodeId !==
              node.id
          ) {
            throw new Error(
              `Existing service instance ${definition.instanceKey} points to an unexpected service or node`,
            );
          }

          console.log(
            `Instance already exists: ${definition.instanceKey}`,
          );
        }

        const bindings =
          await controlPlane
            .infra
            .listServiceRuntimeBindings
            .execute();

        const binding =
          bindings.find(
            (candidate) =>
              candidate
                .serviceInstanceId ===
              instance.id,
          );

        if (
          !binding ||
          binding.runtimeKind !==
            'docker' ||
          binding.resourceName !==
            definition.resourceName
        ) {
          await controlPlane
            .infra
            .setServiceRuntimeBinding
            .execute({
              serviceInstanceId:
                instance.id,
              runtimeKind:
                'docker',
              resourceName:
                definition.resourceName,
            });

          console.log(
            `Runtime binding set: ${definition.instanceKey} -> ${definition.resourceName}`,
          );
        } else {
          console.log(
            `Runtime binding already correct: ${definition.instanceKey}`,
          );
        }
      }

      console.log(
        'Infrastructure bootstrap complete.',
      );
    } finally {
      await database.destroy();
    }
  };

void main();