import {
  Bot,
} from 'lucide-react';

import {
  createAppId,
  defineApp,
} from '../app-manifest';

export const automationsApp =
  defineApp({
    id: createAppId(
      'automations',
    ),

    name: 'Automatizaciones',

    description:
      'Rutinas, acciones y tareas automáticas.',

    route: '/automatizaciones',

    icon: Bot,

    tone: 'mint',

    accessPermission:
      'app.automations.access',

    enabled: true,

    showOnHome: true,

    order: 60,
  });
