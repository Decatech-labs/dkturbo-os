'use client';

import {
  useRouter,
} from 'next/navigation';

import {
  type KeyboardEvent,
  useRef,
  useState,
} from 'react';

interface InlineWeekMetadataProps {
  athleteId:
    string;

  weekId:
    string;

  initialTitle:
    string | null;

  initialNotes:
    string | null;

  canWrite:
    boolean;
}

export function InlineWeekMetadata({
  athleteId,
  weekId,
  initialTitle,
  initialNotes,
  canWrite,
}: InlineWeekMetadataProps) {
  const router =
    useRouter();

  const [
    title,
    setTitle,
  ] =
    useState(
      initialTitle ??
      '',
    );

  const [
    notes,
    setNotes,
  ] =
    useState(
      initialNotes ??
      '',
    );

  const [
    titleEditing,
    setTitleEditing,
  ] =
    useState(
      false,
    );

  const [
    notesEditing,
    setNotesEditing,
  ] =
    useState(
      false,
    );

  const [
    saving,
    setSaving,
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

  const lastSavedTitle =
    useRef(
      initialTitle ??
      '',
    );

  const lastSavedNotes =
    useRef(
      initialNotes ??
      '',
    );

  const save =
    async (): Promise<boolean> => {
      const cleanTitle =
        title.trim();

      const cleanNotes =
        notes.trim();

      if (
        cleanTitle ===
          lastSavedTitle.current &&
        cleanNotes ===
          lastSavedNotes.current
      ) {
        return true;
      }

      setSaving(
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
            )}/weeks/${encodeURIComponent(
              weekId,
            )}`,
            {
              method:
                'PATCH',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  title:
                    cleanTitle ||
                    null,

                  notes:
                    cleanNotes ||
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
              'No tienes permiso para modificar esta semana.',
            );
          }

          throw new Error(
            'No se han podido guardar los cambios.',
          );
        }

        lastSavedTitle.current =
          cleanTitle;

        lastSavedNotes.current =
          cleanNotes;

        router.refresh();

        return true;
      } catch (
        caught
      ) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'No se han podido guardar los cambios.',
        );

        return false;
      } finally {
        setSaving(
          false,
        );
      }
    };

  const finishTitle =
    async () => {
      if (
        !titleEditing
      ) {
        return;
      }

      const saved =
        await save();

      if (saved) {
        setTitleEditing(
          false,
        );
      }
    };

  const finishNotes =
    async () => {
      if (
        !notesEditing
      ) {
        return;
      }

      const saved =
        await save();

      if (saved) {
        setNotesEditing(
          false,
        );
      }
    };

  const handleTitleKeyDown =
    (
      event:
        KeyboardEvent<HTMLInputElement>,
    ) => {
      if (
        event.key ===
        'Enter'
      ) {
        event.preventDefault();

        void finishTitle();
      }

      if (
        event.key ===
        'Escape'
      ) {
        setTitle(
          lastSavedTitle.current,
        );

        setTitleEditing(
          false,
        );
      }
    };

  const handleNotesKeyDown =
    (
      event:
        KeyboardEvent<HTMLTextAreaElement>,
    ) => {
      if (
        event.key ===
          'Enter' &&
        (
          event.metaKey ||
          event.ctrlKey
        )
      ) {
        event.preventDefault();

        void finishNotes();
      }

      if (
        event.key ===
        'Escape'
      ) {
        setNotes(
          lastSavedNotes.current,
        );

        setNotesEditing(
          false,
        );
      }
    };

  if (!canWrite) {
    return (
      <div className="training-week-inline-metadata">

        <h1>
          {initialTitle ??
            'Semana de entrenamiento'}
        </h1>

        {initialNotes && (
          <p>
            {initialNotes}
          </p>
        )}

      </div>
    );
  }

  return (
    <div className="training-week-inline-metadata">

      {titleEditing ? (
        <input
          className="training-week-inline-title-input"
          value={
            title
          }
          autoFocus
          disabled={
            saving
          }
          onChange={(
            event,
          ) =>
            setTitle(
              event.target.value,
            )
          }
          onKeyDown={
            handleTitleKeyDown
          }
          onBlur={() => {
            void finishTitle();
          }}
          aria-label="Título de la semana"
        />
      ) : (
        <h1
          className="training-week-inline-title"
          tabIndex={
            0
          }
          onClick={() =>
            setTitleEditing(
              true,
            )
          }
          onKeyDown={(
            event,
          ) => {
            if (
              event.key ===
                'Enter' ||
              event.key ===
                ' '
            ) {
              event.preventDefault();

              setTitleEditing(
                true,
              );
            }
          }}
        >
          {title ||
            'Semana de entrenamiento'}
        </h1>
      )}

      {notesEditing ? (
        <textarea
          className="training-week-inline-notes-input"
          value={
            notes
          }
          autoFocus
          disabled={
            saving
          }
          rows={
            3
          }
          onChange={(
            event,
          ) =>
            setNotes(
              event.target.value,
            )
          }
          onKeyDown={
            handleNotesKeyDown
          }
          onBlur={() => {
            void finishNotes();
          }}
          aria-label="Notas de la semana"
        />
      ) : (
        <p
          className={[
            'training-week-inline-notes',

            notes
              ? ''
              : 'training-week-inline-notes-empty',
          ]
            .filter(
              Boolean,
            )
            .join(
              ' ',
            )}
          tabIndex={
            0
          }
          onClick={() =>
            setNotesEditing(
              true,
            )
          }
          onKeyDown={(
            event,
          ) => {
            if (
              event.key ===
                'Enter' ||
              event.key ===
                ' '
            ) {
              event.preventDefault();

              setNotesEditing(
                true,
              );
            }
          }}
        >
          {notes ||
            'Añadir notas de la semana…'}
        </p>
      )}

      {saving && (
        <span className="training-week-inline-saving">
          Guardando…
        </span>
      )}

      {error && (
        <span
          className="training-week-inline-error"
          role="alert"
        >
          {error}
        </span>
      )}

    </div>
  );
}
