'use client';

import type {
  AccessPermissionKey,
  AccessProfileResponse,
} from '@dkturbo/contracts';

import {
  Bot,
  ChevronDown,
  Folder,
  ImageIcon,
  Server,
  Shield,
  Users,
  Dumbbell,
} from 'lucide-react';

import type {
  LucideIcon,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

interface PersonPermissionsProps {
  userId: string;
}

interface CapabilityDefinition {
  key: AccessPermissionKey;
  label: string;
  description: string;
}

interface AppDefinition {
  id: string;
  name: string;
  accessPermission: AccessPermissionKey;
  icon: LucideIcon;
  tone:
    | 'blue'
    | 'purple'
    | 'pink'
    | 'green';
  capabilities: CapabilityDefinition[];
}

const apps: AppDefinition[] = [
  {
    id: 'system',
    name: 'Sistema',
    accessPermission: 'app.system.access',
    icon: Server,
    tone: 'blue',

    capabilities: [
      {
        key: 'system.services.restart',
        label: 'Reiniciar servicios',
        description:
          'Permite reiniciar servicios desde Sistema.',
      },
    ],
  },

  {
    id: 'family',
    name: 'Familia',
    accessPermission: 'app.family.access',
    icon: Users,
    tone: 'purple',
    capabilities: [],
  },

  {
    id: 'training',
    name: 'Entrenamientos',
    accessPermission: 'app.training.access',
    icon: Dumbbell,
    tone: 'blue',
    capabilities: [],
  },

  {
    id: 'files',
    name: 'Archivos',
    accessPermission: 'app.files.access',
    icon: Folder,
    tone: 'blue',
    capabilities: [],
  },

  {
    id: 'photos',
    name: 'Fotos',
    accessPermission: 'app.photos.access',
    icon: ImageIcon,
    tone: 'pink',
    capabilities: [],
  },

  {
    id: 'automations',
    name: 'Automatizaciones',
    accessPermission:
      'app.automations.access',
    icon: Bot,
    tone: 'purple',
    capabilities: [],
  },

  {
    id: 'security',
    name: 'Seguridad',
    accessPermission:
      'app.security.access',
    icon: Shield,
    tone: 'green',
    capabilities: [],
  },
];

const getStatus = (
  hasAppAccess: boolean,
  enabledCapabilities: number,
  totalCapabilities: number,
): {
  label: string;
  tone:
    | 'none'
    | 'limited'
    | 'full';
} => {
  if (!hasAppAccess) {
    return {
      label: 'Sin acceso',
      tone: 'none',
    };
  }

  if (
    totalCapabilities === 0 ||
    enabledCapabilities ===
      totalCapabilities
  ) {
    return {
      label: 'Acceso completo',
      tone: 'full',
    };
  }

  return {
    label: 'Acceso limitado',
    tone: 'limited',
  };
};

export function PersonPermissions({
  userId,
}: PersonPermissionsProps) {
  const [
    profile,
    setProfile,
  ] =
    useState<
      AccessProfileResponse | null
    >(null);

  const [
    expanded,
    setExpanded,
  ] =
    useState<
      string | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    pending,
    setPending,
  ] =
    useState<
      AccessPermissionKey | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const load =
    async () => {
      setError(null);

      try {
        const response =
          await fetch(
            `/api/family/users/${userId}/access`,
            {
              cache:
                'no-store',
            },
          );

        if (!response.ok) {
          throw new Error(
            'access_load_failed',
          );
        }

        const body =
          await response.json() as
            AccessProfileResponse;

        setProfile(body);
      } catch {
        setError(
          'No se ha podido cargar el acceso.',
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(
    () => {
      void load();
    },
    [
      userId,
    ],
  );

  const isEnabled =
    (
      permission:
        AccessPermissionKey,
    ): boolean =>
      profile?.permissions.includes(
        permission,
      ) ??
      false;

  const setPermission =
    async (
      permission:
        AccessPermissionKey,
      enabled:
        boolean,
    ) => {
      if (
        !profile ||
        pending
      ) {
        return;
      }

      setError(null);
      setPending(
        permission,
      );

      try {
        const response =
          await fetch(
            `/api/family/users/${userId}/access`,
            {
              method:
                'PATCH',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  permission,
                  enabled,
                }),
            },
          );

        if (!response.ok) {
          throw new Error(
            'access_update_failed',
          );
        }

        setProfile(
          (
            current,
          ) => {
            if (!current) {
              return current;
            }

            const permissions =
              enabled
                ? [
                    ...new Set([
                      ...current.permissions,
                      permission,
                    ]),
                  ]
                : current.permissions.filter(
                    (
                      currentPermission,
                    ) =>
                      currentPermission !==
                      permission,
                  );

            return {
              ...current,
              permissions,
            };
          },
        );
      } catch {
        setError(
          'No se ha podido cambiar el permiso.',
        );
      } finally {
        setPending(null);
      }
    };

  if (loading) {
    return (
      <section className="family-management-block">
        <h4>
          Acceso a aplicaciones
        </h4>

        <div className="family-access-loading">
          Cargando acceso…
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="family-management-block">
        <h4>
          Acceso a aplicaciones
        </h4>

        <div className="family-create-person-error">
          {error ??
            'No se ha podido cargar el acceso.'}
        </div>
      </section>
    );
  }

  return (
    <section className="family-management-block family-access-section">
      <div className="family-access-heading">
        <div>
          <h4>
            Acceso a aplicaciones
          </h4>

          <p>
            Decide qué áreas puede usar esta persona y qué acciones tiene permitidas.
          </p>
        </div>
      </div>

      <div className="family-access-apps">
        {apps.map(
          (
            app,
          ) => {
            const Icon =
              app.icon;

            const appEnabled =
              isEnabled(
                app.accessPermission,
              );

            const enabledCapabilities =
              app.capabilities.filter(
                (
                  capability,
                ) =>
                  isEnabled(
                    capability.key,
                  ),
              ).length;

            const status =
              getStatus(
                appEnabled,
                enabledCapabilities,
                app.capabilities.length,
              );

            const isExpanded =
              expanded ===
              app.id;

            return (
              <article
                key={
                  app.id
                }
                className={
                  `family-access-app ${
                    appEnabled
                      ? 'family-access-app-enabled'
                      : ''
                  }`
                }
              >
                <div className="family-access-app-header">
                  <button
                    type="button"
                    className="family-access-app-info"
                    onClick={() => {
                      if (
                        app.capabilities.length ===
                        0
                      ) {
                        return;
                      }

                      setExpanded(
                        isExpanded
                          ? null
                          : app.id,
                      );
                    }}
                  >
                    <div
                      className={
                        `family-access-app-icon family-access-app-icon-${app.tone}`
                      }
                    >
                      <Icon />
                    </div>

                    <div className="family-access-app-copy">
                      <div className="family-access-app-title-row">
                        <strong>
                          {app.name}
                        </strong>

                        <span
                          className={
                            `family-access-status family-access-status-${status.tone}`
                          }
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {app.capabilities.length >
                      0 && (
                      <ChevronDown
                        className={
                          `family-access-chevron ${
                            isExpanded
                              ? 'family-access-chevron-open'
                              : ''
                          }`
                        }
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={
                      appEnabled
                    }
                    aria-label={
                      appEnabled
                        ? `Quitar acceso a ${app.name}`
                        : `Dar acceso a ${app.name}`
                    }
                    className={
                      `family-access-toggle ${
                        appEnabled
                          ? 'family-access-toggle-on'
                          : ''
                      }`
                    }
                    disabled={
                      pending !==
                      null
                    }
                    onClick={() =>
                      void setPermission(
                        app.accessPermission,
                        !appEnabled,
                      )
                    }
                  >
                    <span />
                  </button>
                </div>

                {isExpanded &&
                  app.capabilities.length >
                    0 && (
                    <div className="family-access-capabilities">
                      {app.capabilities.map(
                        (
                          capability,
                        ) => {
                          const enabled =
                            isEnabled(
                              capability.key,
                            );

                          return (
                            <div
                              key={
                                capability.key
                              }
                              className="family-access-capability"
                            >
                              <div className="family-access-capability-copy">
                                <strong>
                                  {
                                    capability.label
                                  }
                                </strong>

                                <span>
                                  {
                                    capability.description
                                  }
                                </span>
                              </div>

                              <button
                                type="button"
                                role="switch"
                                aria-checked={
                                  enabled
                                }
                                aria-label={
                                  capability.label
                                }
                                className={
                                  `family-access-toggle ${
                                    enabled
                                      ? 'family-access-toggle-on'
                                      : ''
                                  }`
                                }
                                disabled={
                                  !appEnabled ||
                                  pending !==
                                    null
                                }
                                onClick={() =>
                                  void setPermission(
                                    capability.key,
                                    !enabled,
                                  )
                                }
                              >
                                <span />
                              </button>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
              </article>
            );
          },
        )}
      </div>

      {error && (
        <div
          className="family-create-person-error"
          role="alert"
        >
          {error}
        </div>
      )}
    </section>
  );
}