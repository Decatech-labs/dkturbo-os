'use client';

import {
  useEffect,
  useState,
} from 'react';

type NutritionPersonAccessRole =
  | 'VIEWER'
  | 'MANAGER';

interface NutritionPersonAccessEntry {
  userId:
    string;

  displayName:
    string;

  role:
    NutritionPersonAccessRole | null;

  isSelf:
    boolean;
}

interface NutritionPersonAccessProps {
  userId:
    string;

  appEnabled:
    boolean;
}

const roleOptions:
  Array<{
    value:
      NutritionPersonAccessRole | null;

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
        'MANAGER',

      label:
        'Gestionar',
    },
  ];

const roleDescription =
  (
    role:
      NutritionPersonAccessRole | null,

    isSelf:
      boolean,
  ): string => {

    if (
      isSelf
    ) {
      return 'Puede consultar y gestionar siempre su propia información nutricional.';
    }

    switch (
      role
    ) {
      case 'MANAGER':
        return 'Puede consultar, añadir, modificar y eliminar la información nutricional de esta persona.';

      case 'VIEWER':
        return 'Puede consultar la información nutricional de esta persona, pero no modificarla.';

      default:
        return 'No puede acceder a la información nutricional de esta persona.';
    }
  };

export function NutritionPersonAccess({
  userId,
  appEnabled,
}: NutritionPersonAccessProps) {

  const [
    entries,
    setEntries,
  ] =
    useState<
      NutritionPersonAccessEntry[] | null
    >(
      null,
    );

  const [
    pendingUserId,
    setPendingUserId,
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
                `/api/nutrition/admin/users/${userId}/person-access`,
                {
                  cache:
                    'no-store',
                },
              );

            if (
              !response.ok
            ) {
              throw new Error(
                'nutrition_access_load_failed',
              );
            }

            const body =
              await response.json() as
                NutritionPersonAccessEntry[];

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
                'No se han podido cargar los permisos de Nutrición.',
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
      subjectUserId:
        string,

      nextRole:
        NutritionPersonAccessRole | null,
    ) => {

      if (
        pendingUserId
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

      const entry =
        previousEntries.find(
          candidate =>
            candidate.userId ===
            subjectUserId,
        );

      if (
        !entry ||
        entry.isSelf
      ) {
        return;
      }

      setError(
        null,
      );

      setPendingUserId(
        subjectUserId,
      );

      setEntries(
        current =>
          current?.map(
            candidate =>
              candidate.userId ===
                subjectUserId
                ? {
                    ...candidate,
                    role:
                      nextRole,
                  }
                : candidate,
          ) ??
          current,
      );

      try {

        const response =
          await fetch(
            `/api/nutrition/admin/users/${userId}/people/${subjectUserId}/access`,
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
            'nutrition_access_update_failed',
          );
        }

      } catch {

        setEntries(
          previousEntries,
        );

        setError(
          'No se ha podido actualizar este permiso.',
        );

      } finally {

        setPendingUserId(
          null,
        );
      }
    };

  return (
    <div className="family-training-access">
      <div className="family-training-access-heading">
        <strong>
          Acceso a personas
        </strong>

        <span>
          Decide qué información nutricional puede consultar o gestionar este usuario.
        </span>
      </div>

      {!appEnabled && (
        <div className="family-training-access-note">
          Activa primero el acceso a Nutrición para utilizar estos permisos.
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

      {entries ===
        null ? (
        <div className="family-training-access-loading">
          Cargando permisos…
        </div>
      ) : entries.length ===
        0 ? (
        <div className="family-training-access-empty">
          No hay personas disponibles.
        </div>
      ) : (
        <div className="family-training-access-list">
          {entries.map(
            entry => {

              const effectiveRole =
                entry.isSelf
                  ? 'MANAGER'
                  : entry.role;

              return (
                <div
                  key={
                    entry.userId
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
                          effectiveRole,
                          entry.isSelf,
                        )
                      }
                    </span>
                  </div>

                  {entry.isSelf ? (
                    <div className="family-training-role-options">
                      <button
                        type="button"
                        className="family-training-role-option family-training-role-option-selected"
                        disabled
                        aria-label="Perfil propio: gestión completa"
                      >
                        Perfil propio
                      </button>
                    </div>
                  ) : (
                    <div
                      className="family-training-role-options"
                      role="group"
                      aria-label={`Acceso de ${entry.displayName}`}
                    >
                      {roleOptions.map(
                        option => {

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
                                pendingUserId !==
                                  null
                              }
                              aria-pressed={
                                selected
                              }
                              onClick={() =>
                                void setRole(
                                  entry.userId,
                                  option.value,
                                )
                              }
                            >
                              {
                                option.label
                              }
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
