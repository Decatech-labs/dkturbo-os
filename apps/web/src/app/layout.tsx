import type { ReactNode } from 'react';

export const metadata = {
  title: 'DKTURBO OS',
  description: 'DKTURBO OS Control Plane',
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
