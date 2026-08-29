'use client';

import {
  RefreshCw,
} from 'lucide-react';

import {
  useState,
  type FormEvent,
} from 'react';

export const ServiceRestartControl = ({
  serviceInstanceId,
  disabled = false,
}: {
  serviceInstanceId: string;
  disabled?: boolean;
}) => {
  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const handleSubmit = (
    _event:
      FormEvent<HTMLFormElement>,
  ) => {
    /*
     * No hacemos preventDefault().
     *
     * El formulario sigue siendo HTML
     * nativo y funcionará aunque React
     * no esté disponible.
     *
     * Cuando React está hidratado,
     * simplemente mejoramos la UX
     * mostrando el estado pendiente.
     */
    setSubmitting(true);
  };

  if (disabled) {
    return (
      <span className="service-restart-native-disabled">
        Reiniciar
      </span>
    );
  }

  return (
    <details className="service-restart-native">
      <summary>
        <RefreshCw />

        <span>
          Reiniciar
        </span>
      </summary>

      <form
        action="/api/service-actions/restart"
        method="post"
        className="service-restart-native-confirm"
        onSubmit={
          handleSubmit
        }
      >
        <input
          type="hidden"
          name="serviceInstanceId"
          value={
            serviceInstanceId
          }
        />

        <span>
          {submitting
            ? 'Reiniciando…'
            : '¿Reiniciar?'}
        </span>

        <button
          type="submit"
          className="service-restart-native-accept"
          disabled={
            submitting
          }
        >
          {submitting ? (
            <>
              <RefreshCw className="service-restart-spinner" />

              <span>
                Reiniciando…
              </span>
            </>
          ) : (
            'Sí'
          )}
        </button>
      </form>
    </details>
  );
};