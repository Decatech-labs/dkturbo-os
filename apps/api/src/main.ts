import {
  createControlPlane,
  checkDatabase,
  createDatabase,
  loadConfig,
  NodeNotFoundError,
  type NodeId,
} from '@dkturbo/control-plane';
import {
  registerNodeRequestSchema,
  nodeParamsSchema,
  type NodeResponse,
} from '@dkturbo/contracts';
import { config as loadDotEnv } from 'dotenv';
import Fastify from 'fastify';

if (process.env.NODE_ENV !== 'production') {
  loadDotEnv({
    path: '../../.env.local',
    quiet: true,
  });
}

const config = loadConfig();

const database = createDatabase({
  connectionString: config.DATABASE_URL,
});

const controlPlane = createControlPlane({
  database,
});

const app = Fastify({
  logger: true,
});

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
    reply.code(503);

    return {
      status: 'not-ready',
      database: 'unavailable',
    };
  }
});

app.post('/api/nodes', async (request, reply) => {
  const parsed = registerNodeRequestSchema.safeParse(
    request.body,
  );

  if (!parsed.success) {
    return reply.code(400).send({
      error: 'invalid_request',
      details: parsed.error.issues,
    });
  }

  const node = await controlPlane.infra.registerNode.execute(
    parsed.data,
  );

  const response: NodeResponse = {
    id: node.id,
    name: node.name,
    hostname: node.hostname,
    createdAt: node.createdAt.toISOString(),
  };

  return reply.code(201).send(response);
});

app.get('/api/nodes', async () => {
  const nodes = await controlPlane.infra.listNodes.execute();

  return nodes.map(
    (node): NodeResponse => ({
      id: node.id,
      name: node.name,
      hostname: node.hostname,
      createdAt: node.createdAt.toISOString(),
    }),
  );
});

app.get('/api/nodes/:id', async (request, reply) => {
  const parsed = nodeParamsSchema.safeParse(
    request.params,
  );

  if (!parsed.success) {
    return reply.code(400).send({
      error: 'invalid_request',
      details: parsed.error.issues,
    });
  }

  try {
    const node = await controlPlane.infra.getNode.execute(
      parsed.data.id as NodeId,
    );

    const response: NodeResponse = {
      id: node.id,
      name: node.name,
      hostname: node.hostname,
      createdAt: node.createdAt.toISOString(),
    };

    return response;
  } catch (error) {
    if (error instanceof NodeNotFoundError) {
      return reply.code(404).send({
        error: 'node_not_found',
      });
    }

    throw error;
  }
});

const shutdown = async (): Promise<void> => {
  await app.close();
  await database.destroy();
};

process.on('SIGINT', () => {
  void shutdown();
});

process.on('SIGTERM', () => {
  void shutdown();
});

const start = async (): Promise<void> => {
  try {
    await checkDatabase(database);

    await app.listen({
      host: config.API_HOST,
      port: config.API_PORT,
    });
  } catch (error) {
    app.log.error(error);
    await database.destroy();
    process.exit(1);
  }
};

await start();
