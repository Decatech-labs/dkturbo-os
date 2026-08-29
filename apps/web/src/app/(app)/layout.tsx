import type {
  ReactNode,
} from 'react';

import {
  requireCurrentSession,
} from '../../lib/auth-server';

import {
  AccountMenu,
} from './account-menu';

const getInitials = (
  name: string,
): string => {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  const first =
    parts[0];

  if (!first) {
    return 'DK';
  }

  if (parts.length === 1) {
    return first
      .slice(0, 2)
      .toUpperCase();
  }

  const last =
    parts.at(-1) ??
    first;

  return (
    first.charAt(0) +
    last.charAt(0)
  ).toUpperCase();
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session =
    await requireCurrentSession();

  return (
    <div className="app-shell">
      <div className="app-shell-account">
        <AccountMenu
          name={
            session.user.name
          }
          email={
            session.user.email
          }
          initials={
            getInitials(
              session.user.name,
            )
          }
        />
      </div>

      {children}
    </div>
  );
}
