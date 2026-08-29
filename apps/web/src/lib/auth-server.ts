import {
  cookies,
} from 'next/headers';

import {
  redirect,
} from 'next/navigation';

const API_BASE_URL =
  (
    process.env.DKTURBO_API_URL ??
    'http://127.0.0.1:3001'
  ).replace(
    /\/$/,
    '',
  );

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export interface CurrentSession {
  user: CurrentUser;

  session: {
    id: string;
    expiresAt: string;
  };
}

export const getCurrentSession =
  async (): Promise<
    CurrentSession | null
  > => {
    const cookieStore =
      await cookies();

    const cookieHeader =
      cookieStore
        .getAll()
        .map(
          ({ name, value }) =>
            `${name}=${value}`,
        )
        .join('; ');

    const response =
      await fetch(
        `${API_BASE_URL}/api/auth/get-session`,
        {
          headers: {
            cookie:
              cookieHeader,
          },

          cache: 'no-store',
        },
      );

    if (!response.ok) {
      return null;
    }

    const session =
      await response.json() as CurrentSession | null;

    if (
      !session?.user?.id ||
      !session.user.email
    ) {
      return null;
    }

    return session;
  };

export const requireCurrentSession =
  async (): Promise<
    CurrentSession
  > => {
    const session =
      await getCurrentSession();

    if (!session) {
      redirect('/login');
    }

    return session;
  };
