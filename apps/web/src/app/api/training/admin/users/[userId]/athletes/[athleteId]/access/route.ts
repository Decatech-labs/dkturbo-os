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
      userId: string;
      athleteId: string;
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

export async function PUT(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  const {
    userId,
    athleteId,
  } =
    await params;

  const cookie =
    await getCookieHeader();

  const body =
    await request.json();

  const response =
    await fetch(
      `${API_BASE_URL}/api/training/admin/users/${userId}/athletes/${athleteId}/access`,
      {
        method:
          'PUT',

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
