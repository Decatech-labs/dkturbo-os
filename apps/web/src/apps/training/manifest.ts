import {
  Dumbbell,
} from 'lucide-react';

import {
  createAppId,
  defineApp,
} from '../app-manifest';

export const trainingApp =
  defineApp({
    id:
      createAppId(
        'training',
      ),

    name:
      'Entrenamientos',

    description:
      'Sesiones, progreso y rendimiento.',

    route:
      '/entrenamientos',

    icon:
      Dumbbell,

    tone:
      'blue',

    accessPermission:
      'app.training.access',

    enabled:
      true,

    showOnHome:
      true,

    order:
      30,
  });
