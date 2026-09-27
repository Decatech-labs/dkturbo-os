import {
  cookies,
} from 'next/headers';

const API_BASE_URL =
  (
    process.env.DKTURBO_API_URL ??
    'http://127.0.0.1:3001'
  ).replace(
    /\/$/,
    '',
  );

interface RouteContext {
  params:
    Promise<{
      planId:
        string;
    }>;
}

export async function GET(
  request:
    Request,

  {
    params,
  }: RouteContext,
) {

  const {
    planId,
  } = await params;

  const cookieStore =
    await cookies();

  const cookie =
    cookieStore
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
          `${name}=${value}`,
      )
      .join('; ');

  const requestUrl =
    new URL(
      request.url,
    );

  const userId =
    requestUrl.searchParams.get(
      'userId',
    );

  const filename =
    requestUrl.searchParams.get(
      'filename',
    );

  const upstreamUrl =
    new URL(
      `${API_BASE_URL}/api/nutrition/plans/${encodeURIComponent(
        planId,
      )}/export`,
    );

  if (
    userId
  ) {
    upstreamUrl.searchParams.set(
      'userId',
      userId,
    );
  }

  if (
    filename
  ) {
    upstreamUrl.searchParams.set(
      'filename',
      filename,
    );
  }

  const response =
    await fetch(
      upstreamUrl,
      {
        headers: {
          cookie,
        },

        cache:
          'no-store',
      },
    );

  const body =
    await response.arrayBuffer();

  const headers =
    new Headers();

  const contentType =
    response.headers.get(
      'content-type',
    );

  const contentDisposition =
    response.headers.get(
      'content-disposition',
    );

  const contentLength =
    response.headers.get(
      'content-length',
    );

  if (
    contentType
  ) {
    headers.set(
      'Content-Type',
      contentType,
    );
  }

  if (
    contentDisposition
  ) {
    headers.set(
      'Content-Disposition',
      contentDisposition,
    );
  }

  if (
    contentLength
  ) {
    headers.set(
      'Content-Length',
      contentLength,
    );
  }

  headers.set(
    'Cache-Control',
    'private, no-store',
  );

  return new Response(
    body,
    {
      status:
        response.status,

      headers,
    },
  );
}
