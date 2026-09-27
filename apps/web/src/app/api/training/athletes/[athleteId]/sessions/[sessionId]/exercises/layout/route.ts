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

      sessionId:
        string;

    }>;

}

export async function PUT(

  request:
    Request,

  {
    params,
  }:
    RouteContext,

) {

  const {
    athleteId,
    sessionId,
  } = await params;

  const cookieStore =
    await cookies();

  const body =
    await request.json();

  const response =
    await fetch(

      `${API_BASE_URL}/api/training/athletes/${encodeURIComponent(
        athleteId,
      )}/sessions/${encodeURIComponent(
        sessionId,
      )}/exercises/layout`,

      {

        method:
          'PUT',

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
