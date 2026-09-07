import {
  ArrowLeft,
  LockKeyhole,
} from 'lucide-react';

import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <main className="access-denied-page">
      <Link
        href="/"
        className="system-back"
        aria-label="Volver al inicio"
      >
        <ArrowLeft />
      </Link>

      <div className="access-denied-card">
        <div className="access-denied-icon">
          <LockKeyhole />
        </div>

        <h1>
          Sin acceso
        </h1>

        <p>
          Tu cuenta no tiene acceso a esta sección.
        </p>

        <Link
          href="/"
          className="access-denied-home"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
