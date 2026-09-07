import type {
  FamilyUserResponse,
  PendingApprovalResponse,
} from '@dkturbo/contracts';

import {
  ArrowLeft,
  Clock3,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

import Link from 'next/link';

import {
  FamilyApiError,
  getFamilyDashboard,
} from '../../../lib/family-api';

import {
  ApprovalActions,
} from './approval-actions';

import {
  CreatePersonForm,
} from './create-person-form';

export const dynamic =
  'force-dynamic';

const roleMeta = {
  owner: {
    label:
      'Owner',

    description:
      'Control total de DKTURBO',

    className:
      'family-role-owner',
  },

  member: {
    label:
      'Miembro',

    description:
      'Acceso según permisos',

    className:
      'family-role-member',
  },

  guest: {
    label:
      'Invitado',

    description:
      'Acceso restringido',

    className:
      'family-role-guest',
  },
} satisfies Record<
  FamilyUserResponse['role'],
  {
    label: string;
    description: string;
    className: string;
  }
>;

const formatDate =
  (
    value: string,
  ): string =>
    new Intl.DateTimeFormat(
      'es-ES',
      {
        day:
          'numeric',

        month:
          'short',

        year:
          'numeric',
      },
    ).format(
      new Date(
        value,
      ),
    );

const formatRequestedAt =
  (
    value: string,
  ): string =>
    new Intl.DateTimeFormat(
      'es-ES',
      {
        day:
          'numeric',

        month:
          'short',

        hour:
          '2-digit',

        minute:
          '2-digit',

        timeZone:
          'Europe/Madrid',
      },
    ).format(
      new Date(
        value,
      ),
    );

const formatActionKey =
  (
    actionKey: string,
  ): string => {
    switch (
      actionKey
    ) {
      case 'service.restart':
        return 'Reiniciar servicio';

      case 'node.system.info.read':
        return 'Consultar información del sistema';

      default:
        return actionKey;
    }
  };

const formatTargetKind =
  (
    kind: string,
  ): string => {
    switch (
      kind
    ) {
      case 'infra.node':
        return 'Nodo';

      case 'infra.service':
        return 'Servicio';

      case 'infra.service-instance':
        return 'Instancia de servicio';

      default:
        return kind;
    }
  };

const PersonCard = ({
  user,
}: {
  user:
    FamilyUserResponse;
}) => {
  const role =
    roleMeta[
      user.role
    ];

  return (
    <article className="family-person">
      <div className="family-person-avatar">
        <User />
      </div>

      <div className="family-person-content">
        <div className="family-person-main">
          <div>
            <h3>
              {user.name}
            </h3>

            <p>
              {role.description}
            </p>
          </div>

          <span
            className={
              `family-role ${role.className}`
            }
          >
            {role.label}
          </span>
        </div>

        <div className="family-person-meta">
          En DKTURBO desde{' '}
          {formatDate(
            user.createdAt,
          )}
        </div>
      </div>
    </article>
  );
};

const ApprovalCard = ({
  approval,
  requester,
}: {
  approval:
    PendingApprovalResponse;

  requester:
    FamilyUserResponse | null;
}) => (
  <article className="family-approval">
    <div className="family-approval-top">
      <div className="family-approval-icon">
        <ShieldCheck />
      </div>

      <div className="family-approval-heading">
        <span className="family-approval-requester">
          {requester?.name ??
            'Usuario desconocido'}
        </span>

        <h3>
          {formatActionKey(
            approval.actionKey,
          )}
        </h3>
      </div>

      <div className="family-approval-time">
        <Clock3 />

        {formatRequestedAt(
          approval.requestedAt,
        )}
      </div>
    </div>

    <div className="family-approval-target">
      <span>
        {formatTargetKind(
          approval.target.kind,
        )}
      </span>

      <strong>
        {approval.target.id}
      </strong>
    </div>

    <ApprovalActions
      approvalRequestId={
        approval.id
      }
    />
  </article>
);

export default async function FamilyPage() {
  let data:
    Awaited<
      ReturnType<
        typeof getFamilyDashboard
      >
    >;

  try {
    data =
      await getFamilyDashboard();
  } catch (
    error
  ) {
    const forbidden =
      error instanceof
        FamilyApiError &&
      error.status ===
        403;

    return (
      <main className="family-page">
        <header className="family-page-header">
          <Link
            href="/"
            className="family-back"
            aria-label="Volver al inicio"
          >
            <ArrowLeft />
          </Link>

          <h1>
            Familia
          </h1>
        </header>

        <div className="family-page-error">
          <ShieldCheck />

          <div>
            <strong>
              {forbidden
                ? 'Acceso reservado al owner'
                : 'No puedo cargar Familia'}
            </strong>

            <span>
              {forbidden
                ? 'Esta sección contiene permisos y solicitudes sensibles.'
                : 'Comprueba que el núcleo de DKTURBO está disponible.'}
            </span>
          </div>
        </div>
      </main>
    );
  }

  const usersById =
    new Map(
      data.users.map(
        (
          user,
        ) => [
          user.id,
          user,
        ],
      ),
    );

  return (
    <main className="family-page">
      <header className="family-page-header">
        <Link
          href="/"
          className="family-back"
          aria-label="Volver al inicio"
        >
          <ArrowLeft />
        </Link>

        <h1>
          Familia
        </h1>
      </header>

      <section className="family-section">
        <div className="family-section-header">
          <div>
            <Users />

            <h2>
              Personas
            </h2>
          </div>

          <span>
            {data.users.length}
          </span>
        </div>

        <CreatePersonForm />

        <div className="family-people">
          {data.users.map(
            (
              user,
            ) => (
              <PersonCard
                key={
                  user.id
                }
                user={
                  user
                }
              />
            ),
          )}
        </div>
      </section>

      <section className="family-section">
        <div className="family-section-header">
          <div>
            <ShieldCheck />

            <h2>
              Solicitudes pendientes
            </h2>
          </div>

          <span>
            {
              data
                .pendingApprovals
                .length
            }
          </span>
        </div>

        {data
          .pendingApprovals
          .length >
        0 ? (
          <div className="family-approvals">
            {data.pendingApprovals.map(
              (
                approval,
              ) => (
                <ApprovalCard
                  key={
                    approval.id
                  }
                  approval={
                    approval
                  }
                  requester={
                    approval
                      .requestedBy
                      .kind ===
                    'user'
                      ? usersById.get(
                          approval
                            .requestedBy
                            .id,
                        ) ??
                        null
                      : null
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="family-empty">
            <ShieldCheck />

            <div>
              <strong>
                Todo al día
              </strong>

              <span>
                No hay solicitudes esperando tu decisión.
              </span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
