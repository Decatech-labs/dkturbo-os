import {
  randomUUID,
} from 'node:crypto';

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  betterAuth,
} from 'better-auth';

import {
  Pool,
} from 'pg';

import {
  createControlPlane,
} from '../../composition/create-control-plane.js';

import {
  createUser,
  type UserRole,
} from '../../core/identity/domain/user.js';

import {
  createDatabase,
} from '../../infrastructure/postgres/index.js';

import {
  createHttpServer,
} from './create-http-server.js';

const TEST_DATABASE_URL =
  'postgresql://dkturbo:dkturbo_test@127.0.0.1:5433/dkturbo_test';

const TEST_PASSWORD =
  'Dkturbo-test-password-2026!';

const database =
  createDatabase({
    connectionString:
      TEST_DATABASE_URL,
  });

const controlPlane =
  createControlPlane({
    database,
  });

const withAuthSearchPath = (
  databaseUrl: string,
): string => {
  const url =
    new URL(
      databaseUrl,
    );

  url.searchParams.set(
    'options',
    '-c search_path=auth',
  );

  return url.toString();
};

const authPool =
  new Pool({
    connectionString:
      withAuthSearchPath(
        TEST_DATABASE_URL,
      ),
  });

const testAuth =
  betterAuth({
    database:
      authPool,

    secret:
      'dkturbo-test-secret-that-is-long-enough-for-better-auth',

    baseURL:
      'http://127.0.0.1:3001',

    emailAndPassword: {
      enabled:
        true,

      autoSignIn:
        true,
    },

    advanced: {
      database: {
        generateId: () =>
          randomUUID(),
      },
    },

    trustedOrigins: [
      'http://127.0.0.1:3001',
    ],
  });

const app =
  createHttpServer({
    database,
    controlPlane,
    auth:
      testAuth,
  });

interface TestIdentity {
  id: string;
  name: string;
  email: string;
  cookie: string;
}

let owner:
  TestIdentity;

let memberA:
  TestIdentity;

let memberB:
  TestIdentity;

let guest:
  TestIdentity;

const extractCookie = (
  setCookie:
    | string
    | string[]
    | undefined,
): string => {
  if (!setCookie) {
    throw new Error(
      'Authentication response did not set a cookie',
    );
  }

  const values =
    Array.isArray(
      setCookie,
    )
      ? setCookie
      : [setCookie];

  return values
    .map(
      (value) =>
        value
          .split(
            ';',
            1,
          )[0],
    )
    .join('; ');
};

const createAuthenticatedUser =
  async ({
    name,
    email,
    role,
  }: {
    name: string;
    email: string;
    role: UserRole;
  }): Promise<TestIdentity> => {
    const response =
      await app.inject({
        method:
          'POST',

        url:
          '/api/auth/sign-up/email',

        payload: {
          name,
          email,
          password:
            TEST_PASSWORD,
        },
      });

    expect(
      response.statusCode,
    ).toBe(200);

    const body =
      response.json<{
        user: {
          id: string;
          name: string;
          email: string;
        };
      }>();

    const user =
      createUser({
        id:
          body.user.id,

        name:
          body.user.name,

        role,

        createdAt:
          new Date(),
      });

    await database
      .insertInto(
        'identity.users',
      )
      .values({
        id:
          user.id,

        name:
          user.name,

        role:
          user.role,

        created_at:
          user.createdAt,
      })
      .execute();

    return {
      id:
        body.user.id,

      name:
        body.user.name,

      email:
        body.user.email,

      cookie:
        extractCookie(
          response.headers[
            'set-cookie'
          ],
        ),
    };
  };

const createActionRequestAs =
  async (
    identity:
      TestIdentity,
  ): Promise<string> => {
    const response =
      await app.inject({
        method:
          'POST',

        url:
          '/api/action-requests',

        headers: {
          cookie:
            identity.cookie,
        },

        payload: {
          actionKey:
            'service.restart',

          target: {
            kind:
              'infra.service-instance',

            id:
              randomUUID(),
          },

          parameters: {},
        },
      });

    expect(
      response.statusCode,
    ).toBe(201);

    return response.json<{
      id: string;
    }>().id;
  };

beforeAll(
  async () => {
    /*
     * Test DB isolation.
     *
     * Delete dependants before their parents.
     */
    await database
      .deleteFrom(
        'authz.user_action_permissions',
      )
      .execute();

    await database
      .deleteFrom(
        'authz.approval_requests',
      )
      .execute();

    await database
      .deleteFrom(
        'actions.action_executions',
      )
      .execute();

    await database
      .deleteFrom(
        'actions.action_requests',
      )
      .execute();

    await database
      .deleteFrom(
        'identity.users',
      )
      .execute();

    await authPool.query(
      'DELETE FROM "session"',
    );

    await authPool.query(
      'DELETE FROM "account"',
    );

    await authPool.query(
      'DELETE FROM "user"',
    );

    await database
      .deleteFrom(
        'infra.nodes',
      )
      .where(
        'hostname',
        'like',
        'http-test-%',
      )
      .execute();

    await app.ready();

    owner =
      await createAuthenticatedUser({
        name:
          'HTTP Security Test Owner',

        email:
          'security-owner@dkturbo.test',

        role:
          'owner',
      });

    memberA =
      await createAuthenticatedUser({
        name:
          'HTTP Security Test Member A',

        email:
          'security-member-a@dkturbo.test',

        role:
          'member',
      });

    memberB =
      await createAuthenticatedUser({
        name:
          'HTTP Security Test Member B',

        email:
          'security-member-b@dkturbo.test',

        role:
          'member',
      });

    guest =
      await createAuthenticatedUser({
        name:
          'HTTP Security Test Guest',

        email:
          'security-guest@dkturbo.test',

        role:
          'guest',
      });
  },
);

afterAll(
  async () => {
    await database
      .deleteFrom(
        'authz.user_action_permissions',
      )
      .execute();

    await database
      .deleteFrom(
        'authz.approval_requests',
      )
      .execute();

    await database
      .deleteFrom(
        'actions.action_executions',
      )
      .execute();

    await database
      .deleteFrom(
        'actions.action_requests',
      )
      .execute();

    await database
      .deleteFrom(
        'identity.users',
      )
      .execute();

    await authPool.query(
      'DELETE FROM "session"',
    );

    await authPool.query(
      'DELETE FROM "account"',
    );

    await authPool.query(
      'DELETE FROM "user"',
    );

    await database
      .deleteFrom(
        'infra.nodes',
      )
      .where(
        'hostname',
        'like',
        'http-test-%',
      )
      .execute();

    await app.close();

    await authPool.end();

    await database.destroy();
  },
);

describe(
  'Nodes HTTP API',
  () => {
    it(
      'registers and retrieves a node',
      async () => {
        const hostname =
          `http-test-${randomUUID()}`;

        const createResponse =
          await app.inject({
            method:
              'POST',

            url:
              '/api/nodes',

            payload: {
              name:
                'HTTP Test Node',

              hostname,
            },
          });

        expect(
          createResponse.statusCode,
        ).toBe(201);

        const createdNode =
          createResponse.json<{
            id: string;
            name: string;
            hostname: string;
            createdAt: string;
          }>();

        expect(
          createdNode.name,
        ).toBe(
          'HTTP Test Node',
        );

        expect(
          createdNode.hostname,
        ).toBe(
          hostname,
        );

        const getResponse =
          await app.inject({
            method:
              'GET',

            url:
              `/api/nodes/${createdNode.id}`,
          });

        expect(
          getResponse.statusCode,
        ).toBe(200);

        expect(
          getResponse.json(),
        ).toEqual(
          createdNode,
        );
      },
    );

    it(
      'lists registered nodes',
      async () => {
        const hostname =
          `http-test-${randomUUID()}`;

        const createResponse =
          await app.inject({
            method:
              'POST',

            url:
              '/api/nodes',

            payload: {
              name:
                'HTTP List Test Node',

              hostname,
            },
          });

        expect(
          createResponse.statusCode,
        ).toBe(201);

        const createdNode =
          createResponse.json<{
            id: string;
          }>();

        const listResponse =
          await app.inject({
            method: 'GET',
            url: '/api/nodes',

            headers: {
              cookie:
                owner.cookie,
            },
          });

        expect(
          listResponse.statusCode,
        ).toBe(200);

        const nodes =
          listResponse.json<
            Array<{
              id: string;
            }>
          >();

        expect(
          nodes.some(
            (node) =>
              node.id ===
              createdNode.id,
          ),
        ).toBe(true);
      },
    );

    it(
      'returns 404 for a missing node',
      async () => {
        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/nodes/${randomUUID()}`,
          });

        expect(
          response.statusCode,
        ).toBe(404);

        expect(
          response.json(),
        ).toEqual({
          error:
            'node_not_found',
        });
      },
    );

    it(
      'returns 400 for an invalid node id',
      async () => {
        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/nodes/not-a-valid-uuid',
          });

        expect(
          response.statusCode,
        ).toBe(400);

        expect(
          response.json(),
        ).toMatchObject({
          error:
            'invalid_request',
        });
      },
    );

    it(
      'returns 409 when the hostname is already registered',
      async () => {
        const hostname =
          `http-test-${randomUUID()}`;

        const firstResponse =
          await app.inject({
            method:
              'POST',

            url:
              '/api/nodes',

            payload: {
              name:
                'First Node',

              hostname,
            },
          });

        expect(
          firstResponse.statusCode,
        ).toBe(201);

        const secondResponse =
          await app.inject({
            method:
              'POST',

            url:
              '/api/nodes',

            payload: {
              name:
                'Second Node',

              hostname,
            },
          });

        expect(
          secondResponse.statusCode,
        ).toBe(409);

        expect(
          secondResponse.json(),
        ).toEqual({
          error:
            'node_hostname_already_registered',

          hostname,
        });
      },
    );

    it(
      'registers and lists node capabilities idempotently',
      async () => {
        const hostname =
          `http-test-${randomUUID()}`;

        const createNodeResponse =
          await app.inject({
            method:
              'POST',

            url:
              '/api/nodes',

            payload: {
              name:
                'Capability HTTP Test Node',

              hostname,
            },
          });

        expect(
          createNodeResponse.statusCode,
        ).toBe(201);

        const node =
          createNodeResponse.json<{
            id: string;
          }>();

        const firstResponse =
          await app.inject({
            method:
              'PUT',

            url:
              `/api/nodes/${node.id}` +
              '/capabilities/docker',
          });

        expect(
          firstResponse.statusCode,
        ).toBe(200);

        const secondResponse =
          await app.inject({
            method:
              'PUT',

            url:
              `/api/nodes/${node.id}` +
              '/capabilities/docker',
          });

        expect(
          secondResponse.statusCode,
        ).toBe(200);

        const listResponse =
          await app.inject({
            method:
              'GET',

            url:
              `/api/nodes/${node.id}` +
              '/capabilities',
          });

        expect(
          listResponse.statusCode,
        ).toBe(200);

        const result =
          listResponse.json<
            Array<{
              key: string;
            }>
          >();

        expect(
          result.filter(
            (capability) =>
              capability.key ===
              'docker',
          ),
        ).toHaveLength(1);
      },
    );

    it(
      'registers and lists services',
      async () => {
        const key =
          `test-${randomUUID()}`;

        const createResponse =
          await app.inject({
            method:
              'POST',

            url:
              '/api/services',

            payload: {
              key,

              name:
                'HTTP Test Service',
            },
          });

        expect(
          createResponse.statusCode,
        ).toBe(201);

        const service =
          createResponse.json<{
            id: string;
            key: string;
          }>();

        expect(
          service.key,
        ).toBe(key);

        const listResponse =
          await app.inject({
            method: 'GET',
            url: '/api/services',

            headers: {
              cookie:
                owner.cookie,
            },
          });

        expect(
          listResponse.statusCode,
        ).toBe(200);

        const services =
          listResponse.json<
            Array<{
              id: string;
              key: string;
            }>
          >();

        expect(
          services.some(
            (stored) =>
              stored.id ===
              service.id,
          ),
        ).toBe(true);
      },
    );

    it(
      'returns 409 for a duplicate service key',
      async () => {
        const key =
          `test-${randomUUID()}`;

        const firstResponse =
          await app.inject({
            method:
              'POST',

            url:
              '/api/services',

            payload: {
              key,

              name:
                'First Service',
            },
          });

        expect(
          firstResponse.statusCode,
        ).toBe(201);

        const secondResponse =
          await app.inject({
            method:
              'POST',

            url:
              '/api/services',

            payload: {
              key,

              name:
                'Second Service',
            },
          });

        expect(
          secondResponse.statusCode,
        ).toBe(409);

        expect(
          secondResponse.json(),
        ).toEqual({
          error:
            'service_key_already_registered',

          serviceKey:
            key,
        });
      },
    );
  },
);

describe(
  'Action System security',
  () => {
    it(
      'returns 401 without a session',
      async () => {
        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/action-requests',
          });

        expect(
          response.statusCode,
        ).toBe(401);

        expect(
          response.json(),
        ).toEqual({
          error:
            'authentication_required',
        });
      },
    );

    it(
      'allows the owner to list all action requests',
      async () => {
        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/action-requests',

            headers: {
              cookie:
                owner.cookie,
            },
          });

        expect(
          response.statusCode,
        ).toBe(200);
      },
    );

    it(
      'denies a member access to the global action request list',
      async () => {
        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/action-requests',

            headers: {
              cookie:
                memberA.cookie,
            },
          });

        expect(
          response.statusCode,
        ).toBe(403);
      },
    );

    it(
      'keeps family inventory owner-only',
      async () => {
        const memberResponse =
          await app.inject({
            method:
              'GET',

            url:
              '/api/family/users',

            headers: {
              cookie:
                memberA.cookie,
            },
          });

        expect(
          memberResponse.statusCode,
        ).toBe(403);

        const ownerResponse =
          await app.inject({
            method:
              'GET',

            url:
              '/api/family/users',

            headers: {
              cookie:
                owner.cookie,
            },
          });

        expect(
          ownerResponse.statusCode,
        ).toBe(200);
      },
    );

    it(
      'keeps pending approvals owner-only',
      async () => {
        const memberResponse =
          await app.inject({
            method:
              'GET',

            url:
              '/api/approval-requests/pending',

            headers: {
              cookie:
                memberA.cookie,
            },
          });

        expect(
          memberResponse.statusCode,
        ).toBe(403);

        const ownerResponse =
          await app.inject({
            method:
              'GET',

            url:
              '/api/approval-requests/pending',

            headers: {
              cookie:
                owner.cookie,
            },
          });

        expect(
          ownerResponse.statusCode,
        ).toBe(200);
      },
    );

    it(
      'denies guests from owner-only resources',
      async () => {
        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/family/users',

            headers: {
              cookie:
                guest.cookie,
            },
          });

        expect(
          response.statusCode,
        ).toBe(403);
      },
    );

    it(
      'derives requestedBy from the authenticated session',
      async () => {
        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/api/action-requests',

            headers: {
              cookie:
                memberA.cookie,
            },

            payload: {
              actionKey:
                'service.restart',

              target: {
                kind:
                  'infra.service-instance',

                id:
                  randomUUID(),
              },

              parameters: {},

              /*
               * Malicious input:
               * the API must ignore this.
               */
              requestedBy: {
                kind:
                  'user',

                id:
                  owner.id,
              },
            },
          });

        expect(
          response.statusCode,
        ).toBe(201);

        const body =
          response.json<{
            requestedBy: {
              kind: string;
              id: string;
            };
          }>();

        expect(
          body.requestedBy,
        ).toEqual({
          kind:
            'user',

          id:
            memberA.id,
        });

        expect(
          body.requestedBy.id,
        ).not.toBe(
          owner.id,
        );
      },
    );

    it(
      'allows the requester to inspect authorization for their own request',
      async () => {
        const actionRequestId =
          await createActionRequestAs(
            memberA,
          );

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/action-requests/${actionRequestId}/authorization`,

            headers: {
              cookie:
                memberA.cookie,
            },
          });

        expect(
          response.statusCode,
        ).toBe(200);
      },
    );

    it(
      'denies another member access to someone else action request',
      async () => {
        const actionRequestId =
          await createActionRequestAs(
            memberA,
          );

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/action-requests/${actionRequestId}/authorization`,

            headers: {
              cookie:
                memberB.cookie,
            },
          });

        expect(
          response.statusCode,
        ).toBe(403);
      },
    );

    it(
      'allows the owner to inspect another user action request',
      async () => {
        const actionRequestId =
          await createActionRequestAs(
            memberA,
          );

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/action-requests/${actionRequestId}/authorization`,

            headers: {
              cookie:
                owner.cookie,
            },
          });

        expect(
          response.statusCode,
        ).toBe(200);
      },
    );

    it(
      'denies another member from processing someone else action request',
      async () => {
        const actionRequestId =
          await createActionRequestAs(
            memberA,
          );

        const response =
          await app.inject({
            method:
              'POST',

            url:
              `/api/action-requests/${actionRequestId}/process`,

            headers: {
              cookie:
                memberB.cookie,
            },
          });

        expect(
          response.statusCode,
        ).toBe(403);
      },
    );

    it(
      'denies the requester when they lack an explicit permission',
      async () => {
        const actionRequestId =
          await createActionRequestAs(
            memberA,
          );

        const response =
          await app.inject({
            method:
              'POST',

            url:
              `/api/action-requests/${actionRequestId}/process`,

            headers: {
              cookie:
                memberA.cookie,
            },
          });

        expect(
          response.statusCode,
        ).toBe(200);

        expect(
          response.json(),
        ).toMatchObject({
          outcome:
            'DENIED',
        });
      },
    );
  },
);