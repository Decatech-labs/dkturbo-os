import {
  cookies,
} from 'next/headers';

import {
  NextResponse,
} from 'next/server';

const API_BASE_URL =
  (
    process.env.DKTURBO_API_URL ??
    'http://127.0.0.1:3001'
  ).replace(
    /\/$/,
    '',
  );

interface RouteContext {
  params: Promise<{
    athleteId:
      string;

    performanceEntryId:
      string;
  }>;
}

const buildCookieHeader =
  async (): Promise<string> => {
    const cookieStore =
      await cookies();

    return cookieStore
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
          `${name}=${value}`,
      )
      .join('; ');
  };

export async function PATCH(
  request: Request,

  {
    params,
  }: RouteContext,
) {
  const {
    athleteId,
    performanceEntryId,
  } = await params;

  const cookie =
    await buildCookieHeader();

  const body =
    await request.json();

  const response =
    await fetch(
      `${API_BASE_URL}/api/training/athletes/${encodeURIComponent(
        athleteId,
      )}/performance-entries/${encodeURIComponent(
        performanceEntryId,
      )}`,
      {
        method:
          'PATCH',

        headers: {
          'content-type':
            'application/json',

          cookie,
        },

        body:
          JSON.stringify(
            body,
          ),

        cache:
          'no-store',
      },
    );

  const responseBody =
    await response.json();

  return NextResponse.json(
    responseBody,
    {
      status:
        response.status,
    },
  );
}

export async function DELETE(
  _request: Request,

  {
    params,
  }: RouteContext,
) {
  const {
    athleteId,
    performanceEntryId,
  } = await params;

  const cookie =
    await buildCookieHeader();

  const response =
    await fetch(
      `${API_BASE_URL}/api/training/athletes/${encodeURIComponent(
        athleteId,
      )}/performance-entries/${encodeURIComponent(
        performanceEntryId,
      )}`,
      {
        method:
          'DELETE',

        headers: {
          cookie,
        },

        cache:
          'no-store',
      },
    );

  if (
    response.status ===
    204
  ) {
    return new Response(
      null,
      {
        status:
          204,
      },
    );
  }

  const responseBody =
    await response.json();

  return NextResponse.json(
    responseBody,
    {
      status:
        response.status,
    },
  );
}
