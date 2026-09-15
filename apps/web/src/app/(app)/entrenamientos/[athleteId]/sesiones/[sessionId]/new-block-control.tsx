'use client';

import {
  Plus,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useState,
} from 'react';

interface NewBlockControlProps {
  athleteId:
    string;

  sessionId:
    string;

  position:
    number;
}

export function NewBlockControl({
  athleteId,
  sessionId,
  position,
}: NewBlockControlProps) {
  const router =
    useRouter();

  const [
    editing,
    setEditing,
  ] =
    useState(
      false,
    );

  const [
    title,
    setTitle,
  ] =
    useState('');

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const submit =
    async () => {
      const cleanTitle =
        title.trim();

      if (
        !cleanTitle ||
        submitting
      ) {
        setEditing(
          false,
        );

        setTitle('');

        return;
      }

      setSubmitting(
        true,
      );

      setError(
        null,
      );

      try {
        const response =
          await fetch(
            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/sessions/${encodeURIComponent(
              sessionId,
            )}/blocks`,
            {
              method:
                'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  position,

                  title:
                    cleanTitle,

                  notes:
                    null,
                }),
            },
          );

        if (!response.ok) {
          if (
            response.status ===
            403
          ) {
            throw new Error(
              'No tienes permiso para modificar esta sesión.',
            );
          }

          throw new Error(
            'No se ha podido crear el bloque.',
          );
        }

        setTitle('');
        setEditing(
          false,
        );

        router.refresh();

      } catch (
        caught
      ) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'No se ha podido crear el bloque.',
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    };

  if (!editing) {
    return (
      <button
        type="button"
        className="training-add-block"
        onClick={() => {
          setEditing(
            true,
          );

          setError(
            null,
          );
        }}
      >
        <Plus />

        <span>
          Añadir bloque
        </span>
      </button>
    );
  }

  return (
    <div className="training-add-block-editor">

      <input
        type="text"
        autoFocus
        value={
          title
        }
        disabled={
          submitting
        }
        placeholder="Nombre del bloque…"
        aria-label="Nombre del nuevo bloque"
        onChange={(
          event,
        ) =>
          setTitle(
            event.target.value,
          )
        }
        onKeyDown={(
          event,
        ) => {
          if (
            event.key ===
            'Enter'
          ) {
            event.preventDefault();

            event.currentTarget.blur();
          }

          if (
            event.key ===
            'Escape'
          ) {
            event.preventDefault();

            setTitle('');
            setEditing(
              false,
            );
          }
        }}
        onBlur={() => {
          void submit();
        }}
      />

      {submitting && (
        <span className="training-add-block-status">
          Creando…
        </span>
      )}

      {error && (
        <span
          className="training-add-block-error"
          role="alert"
        >
          {error}
        </span>
      )}

    </div>
  );
}
