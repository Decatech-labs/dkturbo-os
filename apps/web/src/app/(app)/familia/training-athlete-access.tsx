'use client';

import {
  useEffect,
  useState,
} from 'react';

type AthleteAccessRole =
  | 'SELF'
  | 'COACH'
  | 'VIEWER';

interface TrainingAthleteAccessEntry {
  athleteId:
    string;

  displayName:
    string;

  role:
    AthleteAccessRole | null;
}

interface TrainingAthleteAccessProps {
  userId:
    string;

  appEnabled:
    boolean;
}

const roleOptions:
  Array<{
    value:
      AthleteAccessRole | null;

    label:
      string;
  }> = [
    {
      value:
        null,

      label:
        'Sin acceso',
    },

    {
      value:
        'VIEWER',

      label:
        'Ver',
    },

    {
      value:
        'COACH',

      label:
        'Entrenar',
    },

    {
      value:
        'SELF',

      label:
        'Perfil propio',
    },
  ];

const roleDescription =
  (
    role:
      AthleteAccessRole | null,
  ): string => {

    switch (
      role
    ) {
      case 'SELF':
        return 'Puede ver y modificar su propio entrenamiento.';

      case 'COACH':
        return 'Puede consultar y modificar la planificación del atleta.';

      case 'VIEWER':
        return 'Puede consultar el entrenamiento, pero no modificarlo.';

      default:
        return 'No puede acceder a los datos de este atleta.';
    }
  };

export function TrainingAthleteAccess({
  userId,
  appEnabled,
}: TrainingAthleteAccessProps) {

  const [
    entries,
    setEntries,
  ] =
    useState<
      TrainingAthleteAccessEntry[] | null
    >(
      null,
    );

  const [
    pendingAthleteId,
    setPendingAthleteId,
  ] =
    useState<
      string | null
    >(
      null,
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

  useEffect(
    () => {

      let cancelled =
        false;

      const load =
        async () => {

          setError(
            null,
          );

          try {

            const response =
              await fetch(
                `/api/training/admin/users/${userId}/athlete-access`,
                {
                  cache:
                    'no-store',
                },
              );

            if (
              !response.ok
            ) {
              throw new Error(
                'training_access_load_failed',
              );
            }

            const body =
              await response.json() as
                TrainingAthleteAccessEntry[];

            if (
              !cancelled
            ) {
              setEntries(
                body,
              );
            }

          } catch {

            if (
              !cancelled
            ) {
              setError(
                'No se han podido cargar los atletas.',
              );
            }

          }
        };

      void load();

      return () => {
        cancelled =
          true;
      };
    },
    [
      userId,
    ],
  );

  const setRole =
    async (
      athleteId:
        string,

      nextRole:
        AthleteAccessRole | null,
    ) => {

      if (
        pendingAthleteId
      ) {
        return;
      }

      const previousEntries =
        entries;

      if (
        !previousEntries
      ) {
        return;
      }

      setError(
        null,
      );

      setPendingAthleteId(
        athleteId,
      );

      setEntries(
        current =>
          current?.map(
            entry =>
              entry.athleteId ===
                athleteId
                ? {
                    ...entry,
                    role:
                      nextRole,
                  }
                : entry,
          ) ??
          current,
      );

      try {

        const response =
          await fetch(
            `/api/training/admin/users/${userId}/athletes/${athleteId}/access`,
            {
              method:
                'PUT',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  role:
                    nextRole,
                }),
            },
          );

        if (
          !response.ok
        ) {
          throw new Error(
            'training_access_update_failed',
          );
        }

      } catch {

        setEntries(
          previousEntries,
        );

        setError(
          'No se ha podido cambiar el acceso al atleta.',
        );

      } finally {

        setPendingAthleteId(
          null,
        );

      }
    };

  if (
    entries ===
      null &&
    !error
  ) {
    return (
      <div className="family-training-access-loading">
        Cargando atletas…
      </div>
    );
  }

  if (
    entries ===
      null
  ) {
    return (
      <div
        className="family-create-person-error"
        role="alert"
      >
        {error}
      </div>
    );
  }

  if (
    entries.length ===
    0
  ) {
    return (
      <div className="family-training-access-empty">
        Todavía no hay perfiles de atleta.
      </div>
    );
  }

  return (
    <div
      className={`family-training-access ${
        appEnabled
          ? ''
          : 'family-training-access-disabled'
      }`}
    >
      <div className="family-training-access-heading">
        <strong>
          Acceso a atletas
        </strong>

        <span>
          El acceso a Entrenamientos y el acceso a cada atleta se gestionan por separado.
        </span>
      </div>

      <div className="family-training-athletes">
        {entries.map(
          (
            entry,
          ) => {

            const isPending =
              pendingAthleteId ===
              entry.athleteId;

            return (
              <div
                key={
                  entry.athleteId
                }
                className="family-training-athlete"
              >
                <div className="family-training-athlete-copy">
                  <strong>
                    {
                      entry.displayName
                    }
                  </strong>

                  <span>
                    {
                      roleDescription(
                        entry.role,
                      )
                    }
                  </span>
                </div>

                <div
                  className="family-training-role-picker"
                  role="group"
                  aria-label={`Acceso a ${entry.displayName}`}
                >
                  {roleOptions.map(
                    (
                      option,
                    ) => {

                      const selected =
                        entry.role ===
                          option.value;

                      const key =
                        option.value ??
                        'NONE';

                      return (
                        <button
                          key={
                            key
                          }
                          type="button"
                          className={`family-training-role-option ${
                            selected
                              ? 'family-training-role-option-selected'
                              : ''
                          }`}
                          disabled={
                            !appEnabled ||
                            pendingAthleteId !==
                              null
                          }
                          aria-pressed={
                            selected
                          }
                          onClick={() =>
                            void setRole(
                              entry.athleteId,
                              option.value,
                            )
                          }
                        >
                          {
                            isPending &&
                            selected
                              ? 'Guardando…'
                              : option.label
                          }
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>

      {!appEnabled && (
        <div className="family-training-access-notice">
          Activa Entrenamientos para que esta persona pueda utilizar los accesos configurados.
        </div>
      )}

      {error && (
        <div
          className="family-create-person-error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
