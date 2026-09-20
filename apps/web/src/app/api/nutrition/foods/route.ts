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
  request: Request,
) {

  const cookie =
    await getCookieHeader();

  const {
    searchParams,
  } =
    new URL(
      request.url,
    );

  const query =
    searchParams.get(
      'query',
    ) ?? '';

  const response =
    await fetch(
      `${API_BASE_URL}/api/nutrition/foods?query=${encodeURIComponent(
        query,
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

export async function POST(
  request: Request,
) {

  const cookie =
    await getCookieHeader();

  const body =
    await request.json();

  const response =
    await fetch(
      `${API_BASE_URL}/api/nutrition/foods`,
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
