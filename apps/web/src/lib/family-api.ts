import type {
  FamilyUserResponse,
  PendingApprovalResponse,
} from '@dkturbo/contracts';

import {
  cookies,
} from 'next/headers';

const API_BASE_URL =
  (
    process.env.DKTURBO_API_URL ??
    'http://127.0.0.1:3001'
  ).replace(
    /\/$/,
    '',
  );

export class FamilyApiError
  extends Error
{
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(
      `DKTURBO Family API request failed: ${status} ${path}`,
    );
  }
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

const getJson =
  async <T>(
    path: string,
  ): Promise<T> => {
    const cookieHeader =
      await getCookieHeader();

    const response =
      await fetch(
        `${API_BASE_URL}${path}`,
        {
          headers: {
            cookie:
              cookieHeader,
          },

          cache:
            'no-store',
        },
      );

    if (!response.ok) {
      throw new FamilyApiError(
        response.status,
        path,
      );
    }

    return response.json() as Promise<T>;
  };

export interface FamilyDashboardData {
  users:
    FamilyUserResponse[];

  pendingApprovals:
    PendingApprovalResponse[];
}

export const getFamilyDashboard =
  async (
    includePendingApprovals:
      boolean,
  ): Promise<FamilyDashboardData> => {
    const users =
      await getJson<
        FamilyUserResponse[]
      >(
        '/api/family/users',
      );

    const pendingApprovals =
      includePendingApprovals
        ? await getJson<
            PendingApprovalResponse[]
          >(
            '/api/approval-requests/pending',
          )
        : [];

    return {
      users,
      pendingApprovals,
    };
  };
