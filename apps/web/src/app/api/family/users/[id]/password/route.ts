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
      id: string;
    }>;
}

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  const {
    id,
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
      .join('; ');

  const body =
    await request.json();

  const response =
    await fetch(
      `${API_BASE_URL}/api/family/users/${id}/password`,
      {
        method:
          'POST',

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