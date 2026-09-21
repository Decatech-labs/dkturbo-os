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
      mealItemId:
        string;

      userId:
        string;
    }>;
}

export async function PATCH(
  request:
    Request,

  {
    params,
  }:
    RouteContext,
) {

  const {
    mealItemId,
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
      .join('; ');

  const body =
    await request.json();

  const response =
    await fetch(
      `${API_BASE_URL}/api/nutrition/meal-items/${encodeURIComponent(
        mealItemId,
      )}/quantities/${encodeURIComponent(
        userId,
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
