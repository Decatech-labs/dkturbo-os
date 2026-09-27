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

      sessionExerciseId:
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
    athleteId,
    sessionExerciseId,
  } = await params;

  const cookieStore =
    await cookies();

  const body =
    await request.json();

  const response =
    await fetch(

      `${API_BASE_URL}/api/training/athletes/${encodeURIComponent(
        athleteId,
      )}/session-exercises/${encodeURIComponent(
        sessionExerciseId,
      )}`,

      {

        method:
          'PATCH',

        headers: {

          'content-type':
            'application/json',

          cookie:
            cookieStore.toString(),

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

export async function DELETE(

  _request:
    Request,

  {
    params,
  }:
    RouteContext,

) {

  const {
    athleteId,
    sessionExerciseId,
  } = await params;

  const cookieStore =
    await cookies();

  const response =
    await fetch(

      `${API_BASE_URL}/api/training/athletes/${encodeURIComponent(
        athleteId,
      )}/session-exercises/${encodeURIComponent(
        sessionExerciseId,
      )}`,

      {

        method:
          'DELETE',

        headers: {

          cookie:
            cookieStore.toString(),

        },

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
