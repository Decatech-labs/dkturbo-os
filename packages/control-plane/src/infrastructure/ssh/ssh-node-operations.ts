import {
  execFile,
} from 'node:child_process';
import {
  promisify,
} from 'node:util';

import type {
  NodeRuntimeSnapshot,
} from '../../modules/infra/domain/node-observed-state.js';

const execFileAsync =
  promisify(execFile);

export interface SshNodeEndpoint {
  host: string;
  port: number;
  username: string;
}

export interface NodeSystemInfo {
  hostname: string;
  kernelName: string;
  kernelRelease: string;
  architecture: string;
}

export class SshNodeOperations {
  async readSystemInfo(
    endpoint: SshNodeEndpoint,
  ): Promise<NodeSystemInfo> {
    const {
      stdout,
    } = await this.execute(
      endpoint,
      'hostname; uname -s; uname -r; uname -m',
    );

    const [
      hostname = '',
      kernelName = '',
      kernelRelease = '',
      architecture = '',
    ] = stdout
      .trim()
      .split('\n');

    return {
      hostname,
      kernelName,
      kernelRelease,
      architecture,
    };
  }

  async readRuntimeSnapshot(
    endpoint: SshNodeEndpoint,
  ): Promise<NodeRuntimeSnapshot> {
    const remoteCommand = [
      'LC_ALL=C',
      `printf 'UPTIME_SECONDS='`,
      `cut -d' ' -f1 /proc/uptime`,
      `printf 'LOAD_1='`,
      `cut -d' ' -f1 /proc/loadavg`,
      `printf 'LOAD_5='`,
      `cut -d' ' -f2 /proc/loadavg`,
      `printf 'LOAD_15='`,
      `cut -d' ' -f3 /proc/loadavg`,
      `printf 'MEM_TOTAL_KB='`,
      `awk '/^MemTotal:/ {print $2}' /proc/meminfo`,
      `printf 'MEM_AVAILABLE_KB='`,
      `awk '/^MemAvailable:/ {print $2}' /proc/meminfo`,
      `printf 'ROOT_TOTAL_KB='`,
      `df -Pk / | awk 'NR==2 {print $2}'`,
      `printf 'ROOT_USED_KB='`,
      `df -Pk / | awk 'NR==2 {print $3}'`,
      `printf 'ROOT_AVAILABLE_KB='`,
      `df -Pk / | awk 'NR==2 {print $4}'`,
    ].join('; ');

    const {
      stdout,
    } = await this.execute(
      endpoint,
      remoteCommand,
    );

    const values =
      Object.fromEntries(
        stdout
          .trim()
          .split('\n')
          .filter(Boolean)
          .map((line) => {
            const separator =
              line.indexOf('=');

            if (separator === -1) {
              throw new Error(
                `Invalid runtime snapshot line: ${line}`,
              );
            }

            return [
              line.slice(
                0,
                separator,
              ),
              line.slice(
                separator + 1,
              ),
            ];
          }),
      );

    const numberValue = (
      key: string,
    ): number => {
      const value =
        Number(values[key]);

      if (
        !Number.isFinite(value)
      ) {
        throw new Error(
          `Invalid runtime snapshot value for ${key}`,
        );
      }

      return value;
    };

    const uptimeSeconds =
      numberValue(
        'UPTIME_SECONDS',
      );

    const load1 =
      numberValue('LOAD_1');

    const load5 =
      numberValue('LOAD_5');

    const load15 =
      numberValue('LOAD_15');

    const memoryTotalKb =
      numberValue(
        'MEM_TOTAL_KB',
      );

    const memoryAvailableKb =
      numberValue(
        'MEM_AVAILABLE_KB',
      );

    const rootTotalKb =
      numberValue(
        'ROOT_TOTAL_KB',
      );

    const rootUsedKb =
      numberValue(
        'ROOT_USED_KB',
      );

    const rootAvailableKb =
      numberValue(
        'ROOT_AVAILABLE_KB',
      );

    return {
      uptimeSeconds,

      load: {
        oneMinute: load1,
        fiveMinutes: load5,
        fifteenMinutes: load15,
      },

      memory: {
        totalBytes:
          memoryTotalKb *
          1024,

        availableBytes:
          memoryAvailableKb *
          1024,

        usedBytes:
          (
            memoryTotalKb -
            memoryAvailableKb
          ) * 1024,

        usedPercent:
          memoryTotalKb === 0
            ? 0
            : (
                (
                  memoryTotalKb -
                  memoryAvailableKb
                ) /
                memoryTotalKb
              ) * 100,
      },

      rootFilesystem: {
        totalBytes:
          rootTotalKb *
          1024,

        usedBytes:
          rootUsedKb *
          1024,

        availableBytes:
          rootAvailableKb *
          1024,

        usedPercent:
          rootTotalKb === 0
            ? 0
            : (
                rootUsedKb /
                rootTotalKb
              ) * 100,
      },
    };
  }

  async readDockerContainerState(
    endpoint: SshNodeEndpoint,
    resourceName: string,
  ): Promise<
    'RUNNING' |
    'STOPPED' |
    'MISSING'
  > {
    const resourcePattern =
      /^[A-Za-z0-9][A-Za-z0-9_.-]*$/;

    if (
      !resourcePattern.test(
        resourceName,
      )
    ) {
      throw new Error(
        `Invalid Docker resource name: ${resourceName}`,
      );
    }

    const remoteCommand =
      `if docker inspect ${resourceName} >/dev/null 2>&1; then ` +
      `docker inspect --format '{{if .State.Running}}RUNNING{{else}}STOPPED{{end}}' ${resourceName}; ` +
      `else printf 'MISSING\\n'; fi`;

    const {
      stdout,
    } = await this.execute(
      endpoint,
      remoteCommand,
    );

    const state =
      stdout.trim();

    if (
      state !== 'RUNNING' &&
      state !== 'STOPPED' &&
      state !== 'MISSING'
    ) {
      throw new Error(
        `Invalid Docker runtime state: ${state}`,
      );
    }

    return state;
  }

  async restartDockerContainer(
    endpoint: SshNodeEndpoint,
    resourceName: string,
  ): Promise<void> {
    const resourcePattern =
      /^[A-Za-z0-9][A-Za-z0-9_.-]*$/;

    if (
      !resourcePattern.test(
        resourceName,
      )
    ) {
      throw new Error(
        `Invalid Docker resource name: ${resourceName}`,
      );
    }

    await this.execute(
      endpoint,
      `docker restart --timeout 10 ${resourceName}`,
      30_000,
    );
  }

  private async execute(
    endpoint: SshNodeEndpoint,
    remoteCommand: string,
    timeoutMs = 10_000,
  ) {
    return execFileAsync(
      'ssh',
      [
        '-o',
        'BatchMode=yes',
        '-o',
        'ConnectTimeout=5',
        '-p',
        String(endpoint.port),
        `${endpoint.username}@${endpoint.host}`,
        remoteCommand,
      ],
      {
        timeout:
          timeoutMs,

        maxBuffer:
          1024 * 1024,
      },
    );
  }
}
