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
  _request: Request,
  {
    params,
  }: RouteContext,
) {
  const {
    userId,
  } =
    await params;

  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${API_BASE_URL}/api/training/admin/users/${userId}/athlete-access`,
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
