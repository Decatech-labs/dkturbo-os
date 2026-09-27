'use client';

import {
  Download,
  X,
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from './training-week-export.module.css';

interface TrainingWeekExportProps {
  athleteId:
    string;

  weekId:
    string;

  athleteName:
    string;

  weekStart:
    string;
}

const buildDefaultFilename =
  (
    athleteName:
      string,

    weekStart:
      string,
  ): string =>
    `Resumen semanal entrenamiento - ${athleteName} - ${weekStart}`;

const getFilenameFromDisposition =
  (
    value:
      string | null,

    fallback:
      string,
  ): string => {

    if (!value) {
      return fallback;
    }

    const encodedMatch =
      value.match(
        /filename\*=UTF-8''([^;]+)/i,
      );

    if (
      encodedMatch?.[1]
    ) {
      try {
        return decodeURIComponent(
          encodedMatch[1],
        );
      } catch {
        // Fall through to the regular filename.
      }
    }

    const regularMatch =
      value.match(
        /filename="([^"]+)"/i,
      );

    return regularMatch?.[1] ??
      fallback;
  };

export function TrainingWeekExport({
  athleteId,
  weekId,
  athleteName,
  weekStart,
}: TrainingWeekExportProps) {

  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );

  const [
    filename,
    setFilename,
  ] =
    useState(
      () =>
        buildDefaultFilename(
          athleteName,
          weekStart,
        ),
    );

  const [
    exporting,
    setExporting,
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

  const dialogRef =
    useRef<
      HTMLDivElement | null
    >(
      null,
    );

  useEffect(
    () => {

      if (!open) {
        return;
      }

      const handleKeyDown =
        (
          event:
            KeyboardEvent,
        ) => {

          if (
            event.key ===
            'Escape' &&
            !exporting
          ) {
            setOpen(
              false,
            );
          }
        };

      window.addEventListener(
        'keydown',
        handleKeyDown,
      );

      return () => {
        window.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      };
    },
    [
      open,
      exporting,
    ],
  );

  const close =
    () => {

      if (
        exporting
      ) {
        return;
      }

      setError(
        null,
      );

      setOpen(
        false,
      );
    };

  const exportPdf =
    async () => {

      if (
        exporting
      ) {
        return;
      }

      const requestedName =
        filename.trim();

      if (
        !requestedName
      ) {
        setError(
          'Escribe un nombre para el archivo.',
        );

        return;
      }

      setExporting(
        true,
      );

      setError(
        null,
      );

      try {

        const params =
          new URLSearchParams({
            filename:
              requestedName,
          });

        const response =
          await fetch(
            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/weeks/${encodeURIComponent(
              weekId,
            )}/export?${params.toString()}`,
            {
              method:
                'GET',

              cache:
                'no-store',
            },
          );

        if (
          !response.ok
        ) {
          setError(
            response.status ===
              403
              ? 'No tienes permiso para exportar esta semana.'
              : 'No se ha podido generar el PDF.',
          );

          return;
        }

        const blob =
          await response.blob();

        const fallbackFilename =
          `${requestedName}.pdf`;

        const downloadFilename =
          getFilenameFromDisposition(
            response.headers.get(
              'content-disposition',
            ),
            fallbackFilename,
          );

        const objectUrl =
          URL.createObjectURL(
            blob,
          );

        const anchor =
          document.createElement(
            'a',
          );

        anchor.href =
          objectUrl;

        anchor.download =
          downloadFilename;

        document.body.appendChild(
          anchor,
        );

        anchor.click();

        anchor.remove();

        URL.revokeObjectURL(
          objectUrl,
        );

        setOpen(
          false,
        );

      } catch {

        setError(
          'No se ha podido generar el PDF.',
        );

      } finally {

        setExporting(
          false,
        );
      }
    };

  return (
    <>

      <button
        type="button"
        className={styles.trigger}
        onClick={() => {
          setError(
            null,
          );

          setOpen(
            true,
          );
        }}
      >
        <Download />

        <span>
          Exportar PDF
        </span>
      </button>

      {open && (
        <div
          className={styles.backdrop}
          role="presentation"
          onMouseDown={
            event => {

              if (
                event.target ===
                event.currentTarget
              ) {
                close();
              }
            }
          }
        >
          <div
            ref={
              dialogRef
            }
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="training-week-export-title"
          >

            <header className={styles.header}>

              <div>
                <span className={styles.kicker}>
                  Exportar semana
                </span>

                <h2 id="training-week-export-title">
                  PDF de entrenamiento
                </h2>

                <p>
                  {
                    athleteName
                  }
                </p>
              </div>

              <button
                type="button"
                className={styles.close}
                onClick={
                  close
                }
                disabled={
                  exporting
                }
                aria-label="Cerrar"
              >
                <X />
              </button>

            </header>

            <div className={styles.body}>

              <label className={styles.field}>
                <span>
                  Nombre del archivo
                </span>

                <input
                  type="text"
                  value={
                    filename
                  }
                  onChange={
                    event => {
                      setFilename(
                        event.target.value,
                      );

                      if (
                        error
                      ) {
                        setError(
                          null,
                        );
                      }
                    }
                  }
                  disabled={
                    exporting
                  }
                  autoFocus
                />
              </label>

              <div className={styles.summary}>
                <Download />

                <div>
                  <strong>
                    Planificado vs real
                  </strong>

                  <span>
                    Sesiones, ejercicios, series, resultados y notas de la semana.
                  </span>
                </div>
              </div>

              {error && (
                <p
                  className={styles.error}
                  role="alert"
                >
                  {
                    error
                  }
                </p>
              )}

            </div>

            <footer className={styles.footer}>

              <button
                type="button"
                className={styles.cancel}
                onClick={
                  close
                }
                disabled={
                  exporting
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.export}
                onClick={() => {
                  void exportPdf();
                }}
                disabled={
                  exporting
                }
              >
                <Download />

                {
                  exporting
                    ? 'Generando…'
                    : 'Exportar PDF'
                }
              </button>

            </footer>

          </div>
        </div>
      )}

    </>
  );
}
