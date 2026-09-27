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
  params:
    Promise<{
      athleteId:
        string;
    }>;
}

const getCookieHeader =
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

export async function GET(
  request:
    Request,

  {
    params,
  }:
    RouteContext,
) {

  const {
    athleteId,
  } =
    await params;

  const requestUrl =
    new URL(
      request.url,
    );

  const from =
    requestUrl
      .searchParams
      .get(
        'from',
      );

  const to =
    requestUrl
      .searchParams
      .get(
        'to',
      );

  const upstreamQuery =
    new URLSearchParams();

  if (from) {
    upstreamQuery.set(
      'from',
      from,
    );
  }

  if (to) {
    upstreamQuery.set(
      'to',
      to,
    );
  }

  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${API_BASE_URL}/api/training/athletes/${encodeURIComponent(
        athleteId,
      )}/daily-checkins?${upstreamQuery.toString()}`,
      {
        headers: {
          cookie,
        },

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
