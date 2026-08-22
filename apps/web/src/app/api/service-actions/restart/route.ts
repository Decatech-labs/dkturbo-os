interface ActionRequestResponse {
  id: string;
}

interface ProcessResponse {
  outcome: string;
  executionId?: string;
}

interface ExecutionResponse {
  status: string;
}

const getRequestOrigin = (
  request: Request,
): string => {
  const forwardedProtocol =
    request.headers
      .get(
        'x-forwarded-proto',
      )
      ?.split(',')[0]
      ?.trim();

  const forwardedHost =
    request.headers
      .get(
        'x-forwarded-host',
      )
      ?.split(',')[0]
      ?.trim();

  const host =
    forwardedHost ??
    request.headers.get(
      'host',
    );

  if (!host) {
    return new URL(
      request.url,
    ).origin;
  }

  const protocol =
    forwardedProtocol ??
    new URL(
      request.url,
    ).protocol.replace(
      ':',
      '',
    );

  return `${protocol}://${host}`;
};

const getControlPlaneUrl = (
  request: Request,
  path: string,
): string => {
  const origin =
    getRequestOrigin(
      request,
    );

  return `${origin}/api/control-plane${path.replace(
    /^\/api/,
    '',
  )}`;
};

const postApi = async <T>(
  request: Request,
  path: string,
  cookie: string | null,
  body?: unknown,
): Promise<T> => {
  const init:
    RequestInit = {
    method: 'POST',
  };

  const headers =
    new Headers();

  if (cookie) {
    headers.set(
      'cookie',
      cookie,
    );
  }

  if (
    body !== undefined
  ) {
    headers.set(
      'content-type',
      'application/json',
    );

    init.body =
      JSON.stringify(
        body,
      );
  }

  init.headers = headers;

  const response =
    await fetch(
      getControlPlaneUrl(
        request,
        path,
      ),
      init,
    );

  if (!response.ok) {
    throw new Error(
      `API ${response.status} ${path}`,
    );
  }

  return response.json() as Promise<T>;
};

const redirectToSystem = (
  _request: Request,
  result: string,
) => {
  const location =
    `/sistema?restart=${encodeURIComponent(
      result,
    )}`;

  return new Response(
    null,
    {
      status: 303,

      headers: {
        Location:
          location,
      },
    },
  );
};

export async function POST(
  request: Request,
) {
  try {
    const formData =
      await request.formData();

    const serviceInstanceId =
      formData.get(
        'serviceInstanceId',
      );

    if (
      typeof serviceInstanceId !==
        'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        serviceInstanceId,
      )
    ) {
      return redirectToSystem(
        request,
        'invalid',
      );
    }

    const cookie =
      request.headers.get(
        'cookie',
      );

    const actionRequest =
      await postApi<
        ActionRequestResponse
      >(
        request,
        '/api/action-requests',
        cookie,
        {
          actionKey:
            'service.restart',

          target: {
            kind:
              'infra.service-instance',

            id:
              serviceInstanceId,
          },

          parameters: {},
        },
      );

    const processed =
      await postApi<
        ProcessResponse
      >(
        request,
        `/api/action-requests/${actionRequest.id}/process`,
        cookie,
      );

    if (
      processed.outcome !==
        'READY' ||
      !processed.executionId
    ) {
      return redirectToSystem(
        request,
        processed.outcome
          .toLowerCase(),
      );
    }

    const execution =
      await postApi<
        ExecutionResponse
      >(
        request,
        `/api/action-executions/${processed.executionId}/execute`,
        cookie,
      );

    if (
      execution.status !==
      'SUCCEEDED'
    ) {
      return redirectToSystem(
        request,
        'failed',
      );
    }

    return redirectToSystem(
      request,
      'success',
    );
  } catch (error) {
    console.error(
      'Service restart failed',
      error,
    );

    return redirectToSystem(
      request,
      'failed',
    );
  }
}