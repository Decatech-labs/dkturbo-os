import type {
  Metadata,
} from 'next';

import type {
  ReactNode,
} from 'react';

import '@dkturbo/design-system/tokens.css';
import '@dkturbo/design-system/styles.css';

import './globals.css';

export const metadata:
  Metadata = {
  title: 'DKTURBO OS',
  description:
    'Personal Control Plane',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
