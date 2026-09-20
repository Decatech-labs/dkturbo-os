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
    planId:
      string;
  }>;
}

export async function GET(
  _request: Request,
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

  const response =
    await fetch(
      `${API_BASE_URL}/api/nutrition/plans/${encodeURIComponent(
        planId,
      )}`,
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
