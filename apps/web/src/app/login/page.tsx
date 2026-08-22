'use client';

import {
  useState,
  type FormEvent,
} from 'react';

import {
  ArrowRight,
  LockKeyhole,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  authClient,
} from '../../lib/auth-client';

export default function LoginPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const submit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (submitting) {
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        const result =
          await authClient
            .signIn
            .email({
              email:
                email.trim(),

              password,
            });

        if (result.error) {
          setError(
            result.error.message ??
              'No se ha podido iniciar sesión.',
          );

          return;
        }

        router.replace('/');
        router.refresh();
      } catch {
        setError(
          'No se ha podido conectar con DKTURBO.',
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <main className="login-page">
      <form
        className="login-card"
        onSubmit={submit}
      >
        <div className="login-icon">
          <LockKeyhole />
        </div>

        <h1>
          DKTURBO OS
        </h1>

        <div className="login-fields">
          <label>
            <span>
              Correo
            </span>

            <input
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(
                event,
              ) => {
                setEmail(
                  event.target
                    .value,
                );
              }}
            />
          </label>

          <label>
            <span>
              Contraseña
            </span>

            <input
              type="password"
              value={password}
              autoComplete="current-password"
              required
              onChange={(
                event,
              ) => {
                setPassword(
                  event.target
                    .value,
                );
              }}
            />
          </label>
        </div>

        {error && (
          <div
            className="login-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          className="login-submit"
          disabled={
            submitting
          }
        >
          <span>
            {submitting
              ? 'Entrando…'
              : 'Entrar'}
          </span>

          {!submitting && (
            <ArrowRight />
          )}
        </button>
      </form>
    </main>
  );
}
