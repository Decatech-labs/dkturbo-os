'use client';

import {
  authClient,
} from '../../lib/auth-client';

export const SessionStatus =
  () => {
    const {
      data,
      isPending,
      error,
    } =
      authClient.useSession();

    if (isPending) {
      return (
        <span>
          Comprobando…
        </span>
      );
    }

    if (error) {
      return (
        <span>
          Error de sesión
        </span>
      );
    }

    if (!data) {
      return (
        <span>
          Sin sesión
        </span>
      );
    }

    return (
      <span>
        {data.user.name}
      </span>
    );
  };
