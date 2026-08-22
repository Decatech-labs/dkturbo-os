import {
  ArrowLeft,
  Clock3,
  Gauge,
  HardDrive,
  MemoryStick,
  Server,
  Wifi,
} from 'lucide-react';

import Link from 'next/link';

import type {
  NodeDashboardData,
} from '../../lib/api';

import {
  getNodesDashboard,
} from '../../lib/api';

import {
  StatusPill,
  type StatusPillTone,
} from '@dkturbo/design-system';

export const dynamic =
  'force-dynamic';

const formatPercent = (
  value: number,
): string =>
  `${value.toFixed(0)} %`;

const formatBytes = (
  bytes: number,
): string => {
  const gib =
    bytes /
    1024 /
    1024 /
    1024;

  return `${gib.toFixed(1)} GB`;
};

const formatUptime = (
  seconds: number,
): string => {
  const minutes =
    Math.floor(seconds / 60);

  const days =
    Math.floor(
      minutes / 1440,
    );

  const hours =
    Math.floor(
      (minutes % 1440) / 60,
    );

  const remainingMinutes =
    minutes % 60;

  if (days > 0) {
    return `${days} d ${hours} h`;
  }

  if (hours > 0) {
    return `${hours} h ${remainingMinutes} min`;
  }

  return `${remainingMinutes} min`;
};

const formatTime = (
  value: string | null,
): string => {
  if (!value) {
    return 'Sin lecturas';
  }

  return new Intl.DateTimeFormat(
    'es-ES',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Madrid',
    },
  ).format(new Date(value));
};

const getStatusMeta = (
  status:
    NodeDashboardData['status']['status'],
): {
  label: string;
  tone: StatusPillTone;
} => {
  switch (status) {
    case 'ONLINE':
      return {
        label: 'Todo bien',
        tone: 'success',
      };

    case 'STALE':
      return {
        label: 'Sin actualizar',
        tone: 'warning',
      };

    case 'UNKNOWN':
      return {
        label: 'Sin información',
        tone: 'neutral',
      };
  }
};

const Metric = ({
  icon: Icon,
  label,
  value,
  detail,
  progress,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  detail: string;
  progress?: number;
}) => (
  <div className="system-metric">
    <div className="system-metric-icon">
      <Icon />
    </div>

    <div className="system-metric-label">
      {label}
    </div>

    <div className="system-metric-value">
      {value}
    </div>

    <div className="system-metric-detail">
      {detail}
    </div>

    {progress !== undefined && (
      <div className="system-progress">
        <div
          className="system-progress-value"
          style={{
            width:
              `${Math.min(
                progress,
                100,
              )}%`,
          }}
        />
      </div>
    )}
  </div>
);

const NodePanel = ({
  data,
}: {
  data: NodeDashboardData;
}) => {
  const {
    node,
    status,
    observedState,
  } = data;

  const runtime =
    observedState.runtimeSnapshot;

  const statusMeta =
    getStatusMeta(
      status.status,
    );

  return (
    <article className="system-node">
      <header className="system-node-header">
        <div className="system-node-identity">
          <div className="system-node-icon">
            <Server />
          </div>

          <div>
            <h2 className="system-node-title">
              Servidor de casa
            </h2>

            <div className="system-node-hostname">
              {node.hostname}
            </div>
          </div>
        </div>

        <StatusPill
          label={statusMeta.label}
          tone={statusMeta.tone}
        />
      </header>

      {runtime ? (
        <div className="system-metrics-grid">
          <Metric
            icon={Clock3}
            label="Tiempo activo"
            value={formatUptime(
              runtime.uptimeSeconds,
            )}
            detail="Desde el último reinicio"
          />

          <Metric
            icon={Gauge}
            label="Carga"
            value={
              runtime.load.oneMinute
                .toFixed(2)
            }
            detail={`${runtime.load.fiveMinutes.toFixed(
              2,
            )} · ${runtime.load.fifteenMinutes.toFixed(
              2,
            )}`}
          />

          <Metric
            icon={MemoryStick}
            label="Memoria"
            value={formatPercent(
              runtime.memory.usedPercent,
            )}
            detail={`${formatBytes(
              runtime.memory.usedBytes,
            )} de ${formatBytes(
              runtime.memory.totalBytes,
            )}`}
            progress={
              runtime.memory.usedPercent
            }
          />

          <Metric
            icon={HardDrive}
            label="Almacenamiento"
            value={formatPercent(
              runtime.rootFilesystem
                .usedPercent,
            )}
            detail={`${formatBytes(
              runtime.rootFilesystem
                .usedBytes,
            )} de ${formatBytes(
              runtime.rootFilesystem
                .totalBytes,
            )}`}
            progress={
              runtime.rootFilesystem
                .usedPercent
            }
          />
        </div>
      ) : (
        <div className="system-no-data">
          <Wifi />

          <div>
            <strong>
              Esperando telemetría
            </strong>

            <span>
              Todavía no tengo una lectura
              reciente de este sistema.
            </span>
          </div>
        </div>
      )}

      <footer className="system-node-footer">
        <span>
          Última lectura
        </span>

        <strong>
          {formatTime(
            status.runtimeCollectedAt,
          )}
        </strong>
      </footer>
    </article>
  );
};

export default async function SystemPage() {
  let nodes:
    NodeDashboardData[];

  try {
    nodes =
      await getNodesDashboard();
  } catch (error) {
    console.error(
      'No se ha podido cargar Sistema',
      error,
    );

    return (
      <main className="system-page">
        <header className="system-page-header">
          <Link
            href="/"
            className="system-back"
            aria-label="Volver"
          >
            <ArrowLeft />
          </Link>

          <div>
            <h1>Sistema</h1>
          </div>
        </header>

        <div className="system-error">
          <Wifi />

          <div>
            <strong>
              No puedo conectar con el sistema
            </strong>

            <span>
              Comprueba que el núcleo de
              DKTURBO está activo.
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="system-page">
      <header className="system-page-header">
        <Link
          href="/"
          className="system-back"
          aria-label="Volver al inicio"
        >
          <ArrowLeft />
        </Link>

        <div>
          <div className="system-page-eyebrow">
            DKTURBO OS
          </div>

          <h1>
            Sistema
          </h1>
        </div>
      </header>

      <section className="system-nodes">
        {nodes.map(
          (node) => (
            <NodePanel
              key={node.node.id}
              data={node}
            />
          ),
        )}
      </section>
    </main>
  );
}
