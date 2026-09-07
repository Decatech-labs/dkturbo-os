import type {
  AccessPermissionKey,
  AccessProfileResponse,
} from '@dkturbo/contracts';

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

export const getCurrentAccessProfile =
  async (): Promise<
    AccessProfileResponse | null
  > => {
    const cookie =
      await getCookieHeader();

    const response =
      await fetch(
        `${API_BASE_URL}/api/access/me`,
        {
          headers: {
            cookie,
          },

          cache:
            'no-store',
        },
      );

    if (!response.ok) {
      return null;
    }

    return response.json() as
      Promise<AccessProfileResponse>;
  };

export const hasAccessPermission =
  (
    profile:
      AccessProfileResponse,

    permission:
      AccessPermissionKey,
  ): boolean =>
    profile.role ===
      'owner' ||
    profile.permissions.includes(
      permission,
    );

export const requireAccessPermission =
  async (
    permission:
      AccessPermissionKey,
  ): Promise<
    AccessProfileResponse
  > => {
    const profile =
      await getCurrentAccessProfile();

    if (
      !profile ||
      !hasAccessPermission(
        profile,
        permission,
      )
    ) {
      redirect(
        '/acceso-denegado',
      );
    }

    return profile;
  };
