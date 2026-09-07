'use client';

import {
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Shield,
  Trash2,
  UserCog,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  type FormEvent,
  useState,
} from 'react';

import type {
  FamilyUserResponse,
} from '@dkturbo/contracts';

import {
  PersonPermissions,
} from './person-permissions';

interface PersonManagementProps {
  user:
    FamilyUserResponse;

  canManageUsers:
    boolean;

  canManagePermissions:
    boolean;
}

type ManagedRole =
  | 'member'
  | 'guest';

export function PersonManagement({
  user,
  canManageUsers,
  canManagePermissions,
}: PersonManagementProps) {
  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );

  const [
    role,
    setRole,
  ] =
    useState<ManagedRole>(
      user.role ===
        'guest'
        ? 'guest'
        : 'member',
    );

  const [
    password,
    setPassword,
  ] =
    useState(
      '',
    );

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(
      false,
    );

  const [
    pending,
    setPending,
  ] =
    useState<
      | 'role'
      | 'password'
      | 'sessions'
      | 'delete'
      | null
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

  const isOwner =
    user.role ===
    'owner';

  const request =
    async (
      path:
        string,
      options:
        RequestInit,
    ) => {
      const response =
        await fetch(
          path,
          options,
        );

      if (
        !response.ok
      ) {
        throw new Error(
          'request_failed',
        );
      }
    };

  const saveRole =
    async () => {
      if (
        isOwner ||
        pending
      ) {
        return;
      }

      setError(
        null,
      );

      setPending(
        'role',
      );

      try {
        await request(
          `/api/family/users/${user.id}/role`,
          {
            method:
              'PATCH',

            headers: {
              'content-type':
                'application/json',
            },

            body:
              JSON.stringify({
                role,
              }),
          },
        );

        router.refresh();
      } catch {
        setError(
          'No se ha podido cambiar el rol.',
        );
      } finally {
        setPending(
          null,
        );
      }
    };

  const changePassword =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event
        .preventDefault();

      if (
        isOwner ||
        pending
      ) {
        return;
      }

      setError(
        null,
      );

      setPending(
        'password',
      );

      try {
        await request(
          `/api/family/users/${user.id}/password`,
          {
            method:
              'POST',

            headers: {
              'content-type':
                'application/json',
            },

            body:
              JSON.stringify({
                password,
              }),
          },
        );

        setPassword(
          '',
        );

        setShowPassword(
          false,
        );
      } catch {
        setError(
          'No se ha podido cambiar la contraseña.',
        );
      } finally {
        setPending(
          null,
        );
      }
    };

  const revokeSessions =
    async () => {
      if (
        isOwner ||
        pending
      ) {
        return;
      }

      setError(
        null,
      );

      setPending(
        'sessions',
      );

      try {
        await request(
          `/api/family/users/${user.id}/revoke-sessions`,
          {
            method:
              'POST',
          },
        );
      } catch {
        setError(
          'No se han podido cerrar las sesiones.',
        );
      } finally {
        setPending(
          null,
        );
      }
    };

  const deleteUser =
    async () => {
      if (
        isOwner ||
        pending
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `¿Eliminar la cuenta de ${user.name}? Esta acción no se puede deshacer.`,
        );

      if (
        !confirmed
      ) {
        return;
      }

      setError(
        null,
      );

      setPending(
        'delete',
      );

      try {
        await request(
          `/api/family/users/${user.id}`,
          {
            method:
              'DELETE',
          },
        );

        setOpen(
          false,
        );

        router.refresh();
      } catch {
        setError(
          'No se ha podido eliminar la cuenta.',
        );
      } finally {
        setPending(
          null,
        );
      }
    };

  if (
    !open
  ) {
    return (
      <button
        type="button"
        className="family-manage-person"
        onClick={() =>
          setOpen(
            true,
          )
        }
      >
        <UserCog />
        Gestionar
      </button>
    );
  }

  return (
    <div className="family-management">
      <div className="family-management-header">
        <div>
          <Shield />

          <div>
            <strong>
              Gestionar acceso
            </strong>

            <span>
              {user.name}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="family-management-close"
          onClick={() =>
            setOpen(
              false,
            )
          }
          disabled={
            pending !==
            null
          }
          aria-label="Cerrar gestión"
        >
          <X />
        </button>
      </div>

      {isOwner ? (
        <div className="family-management-owner">
          El owner se gestiona fuera de este panel.
        </div>
      ) : (
        <>
          {canManageUsers && (
            <section className="family-management-block">
              <h4>
                Rol
              </h4>

              <div className="family-management-role">
                <select
                  value={
                    role
                  }
                  disabled={
                    pending !==
                    null
                  }
                  onChange={
                    (event) =>
                      setRole(
                        event
                          .target
                          .value as
                          ManagedRole,
                      )
                  }
                >
                  <option value="member">
                    Miembro
                  </option>

                  <option value="guest">
                    Invitado
                  </option>
                </select>

                <button
                  type="button"
                  disabled={
                    pending !==
                    null ||
                    role ===
                      user.role
                  }
                  onClick={() =>
                    void saveRole()
                  }
                >
                  {pending ===
                  'role'
                    ? 'Guardando…'
                    : 'Guardar'}
                </button>
              </div>
            </section>
          )}

          {canManagePermissions && (
            <PersonPermissions
              userId={
                user.id
              }
            />
          )}

          {canManageUsers && (
            <section className="family-management-block">
              <h4>
                Contraseña
              </h4>

              <form
                className="family-management-password"
                onSubmit={
                  (event) =>
                    void changePassword(
                      event,
                    )
                }
              >
                <div className="family-password-field">
                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      password
                    }
                    minLength={
                      8
                    }
                    maxLength={
                      128
                    }
                    required
                    placeholder="Nueva contraseña"
                    disabled={
                      pending !==
                      null
                    }
                    onChange={
                      (event) =>
                        setPassword(
                          event
                            .target
                            .value,
                        )
                    }
                  />

                  <button
                    type="button"
                    className="family-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (
                          current,
                        ) =>
                          !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    {showPassword
                      ? <EyeOff />
                      : <Eye />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={
                    pending !==
                    null
                  }
                >
                  <KeyRound />
                  {pending ===
                  'password'
                    ? 'Cambiando…'
                    : 'Cambiar contraseña'}
                </button>
              </form>
            </section>
          )}

          {canManageUsers && (
            <section className="family-management-block">
              <h4>
                Sesiones
              </h4>

              <button
                type="button"
                className="family-management-secondary"
                disabled={
                  pending !==
                  null
                }
                onClick={() =>
                  void revokeSessions()
                }
              >
                <LogOut />

                {pending ===
                'sessions'
                  ? 'Cerrando…'
                  : 'Cerrar todas las sesiones'}
              </button>
            </section>
          )}

          {canManageUsers && (
            <section className="family-management-block family-management-danger">
              <h4>
                Zona peligrosa
              </h4>

              <button
                type="button"
                disabled={
                  pending !==
                  null
                }
                onClick={() =>
                  void deleteUser()
                }
              >
                <Trash2 />

                {pending ===
                'delete'
                  ? 'Eliminando…'
                  : 'Eliminar cuenta'}
              </button>
            </section>
          )}
        </>
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
