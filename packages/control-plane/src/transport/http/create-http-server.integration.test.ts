import { randomUUID } from 'node:crypto';

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import { createControlPlane } from '../../composition/create-control-plane.js';
import {
  createDatabase,
} from '../../infrastructure/postgres/index.js';
import { createHttpServer } from './create-http-server.js';

const TEST_DATABASE_URL =
  'postgresql://dkturbo:dkturbo_test@127.0.0.1:5433/dkturbo_test';

const database = createDatabase({
  connectionString: TEST_DATABASE_URL,
});

const controlPlane = createControlPlane({
  database,
});

const app = createHttpServer({
  database,
  controlPlane,
});

beforeAll(async () => {
  await database
    .deleteFrom('infra.nodes')
    .where('hostname', 'like', 'http-test-%')
    .execute();

  await app.ready();
});

afterAll(async () => {
  await database
    .deleteFrom('infra.nodes')
    .where('hostname', 'like', 'http-test-%')
    .execute();

  await app.close();
  await database.destroy();
});

describe('Nodes HTTP API', () => {
  it('registers and retrieves a node', async () => {
    const hostname = `http-test-${randomUUID()}`;

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/nodes',
      payload: {
        name: 'HTTP Test Node',
        hostname,
      },
    });

    expect(createResponse.statusCode).toBe(201);

    const createdNode = createResponse.json<{
      id: string;
      name: string;
      hostname: string;
      createdAt: string;
    }>();

    expect(createdNode.name).toBe('HTTP Test Node');
    expect(createdNode.hostname).toBe(hostname);

    const getResponse = await app.inject({
      method: 'GET',
      url: `/api/nodes/${createdNode.id}`,
    });

    expect(getResponse.statusCode).toBe(200);

    expect(getResponse.json()).toEqual(createdNode);
  });

  it('lists registered nodes', async () => {
    const hostname = `http-test-${randomUUID()}`;

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/nodes',
      payload: {
        name: 'HTTP List Test Node',
        hostname,
      },
    });

    expect(createResponse.statusCode).toBe(201);

    const createdNode = createResponse.json<{
      id: string;
    }>();

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/nodes',
    });

    expect(listResponse.statusCode).toBe(200);

    const nodes = listResponse.json<
      Array<{
        id: string;
      }>
    >();

    expect(
      nodes.some(
        (node) => node.id === createdNode.id,
      ),
    ).toBe(true);
  });

  it('returns 404 for a missing node', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/nodes/${randomUUID()}`,
    });

    expect(response.statusCode).toBe(404);

    expect(response.json()).toEqual({
      error: 'node_not_found',
    });
  });

  it('returns 400 for an invalid node id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/nodes/not-a-valid-uuid',
    });

    expect(response.statusCode).toBe(400);

    expect(response.json()).toMatchObject({
      error: 'invalid_request',
    });
  });

  it('returns 409 when the hostname is already registered', async () => {
    const hostname = `http-test-${randomUUID()}`;

    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/nodes',
      payload: {
        name: 'First Node',
        hostname,
      },
    });

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/api/nodes',
      payload: {
        name: 'Second Node',
        hostname,
      },
    });

    expect(secondResponse.statusCode).toBe(409);

    expect(secondResponse.json()).toEqual({
      error: 'node_hostname_already_registered',
      hostname,
    });
  });
});
