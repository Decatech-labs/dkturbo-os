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
      userId:
        string;
    }>;
}

export async function GET(
  _request:
    Request,

  {
    params,
  }:
    RouteContext,
) {

  const {
    userId,
  } =
    await params;

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
      .join(
        '; ',
      );

  const response =
    await fetch(
      `${API_BASE_URL}/api/nutrition/admin/users/${encodeURIComponent(
        userId,
      )}/person-access`,
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
