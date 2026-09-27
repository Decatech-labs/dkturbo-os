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

interface RouteContext {
  params:
    Promise<{
      conversionId:
        string;
    }>;
}

export async function PATCH(
  request:
    Request,

  context:
    RouteContext,
) {

  const {
    conversionId,
  } =
    await context.params;

  const cookie =
    await getCookieHeader();

  const body =
    await request.json();

  const response =
    await fetch(
      `${API_BASE_URL}/api/nutrition/food-preparation-conversions/${encodeURIComponent(
        conversionId,
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
    await response
      .json()
      .catch(
        () =>
          null,
      );

  return NextResponse.json(
    responseBody,
    {
      status:
        response.status,
    },
  );
}

export async function DELETE(
  _request:
    Request,

  context:
    RouteContext,
) {

  const {
    conversionId,
  } =
    await context.params;

  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${API_BASE_URL}/api/nutrition/food-preparation-conversions/${encodeURIComponent(
        conversionId,
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
    return new NextResponse(
      null,
      {
        status:
          204,
      },
    );
  }

  const responseBody =
    await response
      .json()
      .catch(
        () =>
          null,
      );

  return NextResponse.json(
    responseBody,
    {
      status:
        response.status,
    },
  );
}
