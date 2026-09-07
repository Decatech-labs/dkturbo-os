import {
  Server,
} from 'lucide-react';

import {
  createAppId,
  defineApp,
} from '../app-manifest';

export const systemApp =
  defineApp({
    id: createAppId(
      'system',
    ),

    name: 'Sistema',

    description:
      'Servidor, red y estado de casa.',

    route: '/sistema',

    icon: Server,

    tone: 'blue',

    accessPermission:
      'app.system.access',

    enabled: true,

    showOnHome: true,

    order: 10,
  });
