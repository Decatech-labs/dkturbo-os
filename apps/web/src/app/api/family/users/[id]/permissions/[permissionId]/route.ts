import {
  cookies,
} from 'next/headers';

interface RouteContext {
  params:
    Promise<{
      id: string;
      permissionId: string;
    }>;
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: RouteContext,
) {
  const {
    id,
    permissionId,
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

  const response =
    await fetch(
      `${(
        process.env.DKTURBO_API_URL ??
        'http://127.0.0.1:3001'
      ).replace(
        /\/$/,
        '',
      )}/api/family/users/${id}/permissions/${permissionId}`,
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
    return new Response(
      null,
      {
        status:
          204,
      },
    );
  }

  const body =
    await response.json();

  return Response.json(
    body,
    {
      status:
        response.status,
    },
  );
}
