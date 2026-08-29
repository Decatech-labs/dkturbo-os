'use client';

import {
  LogOut,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useState,
} from 'react';

import {
  authClient,
} from '../../lib/auth-client';

export const AccountMenu = ({
  name,
  email,
  initials,
}: {
  name: string;
  email: string;
  initials: string;
}) => {
  const router =
    useRouter();

  const [
    signingOut,
    setSigningOut,
  ] = useState(false);

  const signOut =
    async () => {
      if (signingOut) {
        return;
      }

      setSigningOut(true);

      try {
        await authClient
          .signOut();

        router.replace(
          '/login',
        );

        router.refresh();
      } finally {
        setSigningOut(false);
      }
    };

  return (
    <details className="account-menu">
      <summary
        className="profile-button"
        aria-label="Perfil"
      >
        {initials}
      </summary>

      <div className="account-menu-panel">
        <div className="account-menu-user">
          <strong>
            {name}
          </strong>

          <span>
            {email}
          </span>
        </div>

        <button
          type="button"
          className="account-menu-logout"
          disabled={
            signingOut
          }
          onClick={() => {
            void signOut();
          }}
        >
          <LogOut />

          <span>
            {signingOut
              ? 'Saliendo…'
              : 'Cerrar sesión'}
          </span>
        </button>
      </div>
    </details>
  );
};
