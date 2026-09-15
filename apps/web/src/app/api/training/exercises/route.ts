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

export async function GET(
  request: Request,
) {
  const {
    searchParams,
  } =
    new URL(
      request.url,
    );

  const upstreamParams =
    new URLSearchParams();

  for (
    const key of [
      'query',
      'metricProfile',
      'origin',
      'sport',
    ]
  ) {
    const value =
      searchParams.get(
        key,
      );

    if (value) {
      upstreamParams.set(
        key,
        value,
      );
    }
  }

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

  const response =
    await fetch(
      `${API_BASE_URL}/api/training/exercises?${upstreamParams.toString()}`,
      {
        headers: {
          cookie,
        },

        cache:
          'no-store',
      },
    );

  const body =
    await response.json();

  return NextResponse.json(
    body,
    {
      status:
        response.status,
    },
  );
}
