import {
  execFile,
} from 'node:child_process';
import {
  promisify,
} from 'node:util';

import type {
  ActionExecutionGateway,
  ExecuteActionInput,
} from '../../core/actions/ports/action-execution-gateway.port.js';
import type {
  NodeAccessEndpointRepository,
} from '../../modules/infra/ports/node-access-endpoint-repository.port.js';
import type {
  NodeId,
} from '../../modules/infra/domain/node.js';

const execFileAsync =
  promisify(execFile);

export class SshActionExecutionGateway
  implements ActionExecutionGateway
{
  constructor(
    private readonly endpoints:
      NodeAccessEndpointRepository,
  ) {}

  async execute(
    input: ExecuteActionInput,
  ) {
    const endpoint =
      await this.endpoints.findPreferred(
        input.nodeId as NodeId,
        'ssh',
      );

    if (!endpoint) {
      throw new Error(
        `No SSH access endpoint configured for node ${input.nodeId}`,
      );
    }

    switch (input.actionKey) {
      case 'node.system.info.read':
        return this.readSystemInfo(
          endpoint.host,
          endpoint.port,
          endpoint.username,
        );

      default:
        throw new Error(
          `Unsupported SSH action: ${input.actionKey}`,
        );
    }
  }

  private async readSystemInfo(
    host: string,
    port: number,
    username: string,
  ) {
    const {
      stdout,
      stderr,
    } = await execFileAsync(
      'ssh',
      [
        '-o',
        'BatchMode=yes',

        '-o',
        'ConnectTimeout=5',

        '-p',
        String(port),

        `${username}@${host}`,

        'hostname; uname -s; uname -r; uname -m',
      ],
      {
        timeout: 10_000,
        maxBuffer:
          1024 * 1024,
      },
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
      transport: 'ssh',

      endpoint: {
        host,
        port,
        username,
      },

      system: {
        hostname,
        kernelName,
        kernelRelease,
        architecture,
      },

      stderr:
        stderr.trim(),
    };
  }
}
