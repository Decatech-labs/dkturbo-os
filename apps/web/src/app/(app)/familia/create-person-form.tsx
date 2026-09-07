'use client';

import {
  Eye,
  EyeOff,
  Plus,
  UserPlus,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  type FormEvent,
  useState,
} from 'react';

type CreatableRole =
  | 'member'
  | 'guest';

export function CreatePersonForm() {
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
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    showPassword,
    setShowPassword,
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

  const [
    name,
    setName,
  ] =
    useState(
      '',
    );

  const [
    email,
    setEmail,
  ] =
    useState(
      '',
    );

  const [
    password,
    setPassword,
  ] =
    useState(
      '',
    );

  const [
    role,
    setRole,
  ] =
    useState<CreatableRole>(
      'member',
    );

  const reset =
    () => {
      setName('');
      setEmail('');
      setPassword('');
      setRole(
        'member',
      );
      setError(
        null,
      );
      setShowPassword(
        false,
      );
    };

  const close =
    () => {
      if (
        submitting
      ) {
        return;
      }

      reset();
      setOpen(
        false,
      );
    };

  const submit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event
        .preventDefault();

      if (
        submitting
      ) {
        return;
      }

      setError(
        null,
      );

      setSubmitting(
        true,
      );

      try {
        const response =
          await fetch(
            '/api/family/users',
            {
              method:
                'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  name,
                  email,
                  password,
                  role,
                }),
            },
          );

        if (
          !response.ok
        ) {
          const body =
            await response
              .json()
              .catch(
                () => null,
              ) as
              | {
                  error?:
                    string;
                }
              | null;

          if (
            response.status ===
              409 ||
            body?.error ===
              'family_user_auth_creation_failed'
          ) {
            setError(
              'Ya existe una cuenta con ese correo o no se ha podido crear.',
            );

            return;
          }

          if (
            response.status ===
            400
          ) {
            setError(
              'Revisa los datos introducidos.',
            );

            return;
          }

          if (
            response.status ===
            403
          ) {
            setError(
              'Solo el owner puede añadir personas.',
            );

            return;
          }

          throw new Error(
            'family_user_creation_failed',
          );
        }

        reset();

        setOpen(
          false,
        );

        router.refresh();
      } catch {
        setError(
          'No se ha podido añadir la persona.',
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    };

  if (
    !open
  ) {
    return (
      <button
        type="button"
        className="family-add-person"
        onClick={() =>
          setOpen(
            true,
          )
        }
      >
        <Plus />

        <span>
          Añadir persona
        </span>
      </button>
    );
  }

  return (
    <div className="family-create-person">
      <div className="family-create-person-header">
        <div>
          <UserPlus />

          <div>
            <strong>
              Añadir persona
            </strong>

            <span>
              Crea su acceso inicial a DKTURBO.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="family-create-person-close"
          aria-label="Cerrar"
          disabled={
            submitting
          }
          onClick={
            close
          }
        >
          <X />
        </button>
      </div>

      <form
        className="family-create-person-form"
        onSubmit={
          (event) =>
            void submit(
              event,
            )
        }
      >
        <label className="family-field">
          <span>
            Nombre
          </span>

          <input
            type="text"
            name="name"
            autoComplete="name"
            maxLength={
              120
            }
            required
            value={
              name
            }
            disabled={
              submitting
            }
            onChange={
              (event) =>
                setName(
                  event
                    .target
                    .value,
                )
            }
          />
        </label>

        <label className="family-field">
          <span>
            Correo
          </span>

          <input
            type="email"
            name="email"
            autoComplete="email"
            maxLength={
              254
            }
            required
            value={
              email
            }
            disabled={
              submitting
            }
            onChange={
              (event) =>
                setEmail(
                  event
                    .target
                    .value,
                )
            }
          />
        </label>

        <label className="family-field">
          <span>
            Contraseña inicial
          </span>

          <div className="family-password-field">
            <input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              name="password"
              autoComplete="new-password"
              minLength={
                8
              }
              maxLength={
                128
              }
              required
              value={
                password
              }
              disabled={
                submitting
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
              aria-label={
                showPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }
              disabled={
                submitting
              }
              onClick={() =>
                setShowPassword(
                  (
                    current,
                  ) =>
                    !current,
                )
              }
            >
              {showPassword
                ? <EyeOff />
                : <Eye />}
            </button>
          </div>
        </label>

        <fieldset className="family-role-picker">
          <legend>
            Tipo de acceso
          </legend>

          <label
            className={
              `family-role-option ${
                role ===
                'member'
                  ? 'family-role-option-selected'
                  : ''
              }`
            }
          >
            <input
              type="radio"
              name="role"
              value="member"
              checked={
                role ===
                'member'
              }
              disabled={
                submitting
              }
              onChange={() =>
                setRole(
                  'member',
                )
              }
            />

            <div>
              <strong>
                Miembro
              </strong>

              <span>
                Acceso habitual según sus permisos.
              </span>
            </div>
          </label>

          <label
            className={
              `family-role-option ${
                role ===
                'guest'
                  ? 'family-role-option-selected'
                  : ''
              }`
            }
          >
            <input
              type="radio"
              name="role"
              value="guest"
              checked={
                role ===
                'guest'
              }
              disabled={
                submitting
              }
              onChange={() =>
                setRole(
                  'guest',
                )
              }
            />

            <div>
              <strong>
                Invitado
              </strong>

              <span>
                Acceso mínimo y temporal o limitado.
              </span>
            </div>
          </label>
        </fieldset>

        {error && (
          <div
            className="family-create-person-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="family-create-person-actions">
          <button
            type="button"
            className="family-create-person-cancel"
            disabled={
              submitting
            }
            onClick={
              close
            }
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="family-create-person-submit"
            disabled={
              submitting
            }
          >
            <UserPlus />

            <span>
              {submitting
                ? 'Creando…'
                : 'Crear acceso'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
