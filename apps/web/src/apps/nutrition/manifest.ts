import {
  Apple,
} from 'lucide-react';

import {
  createAppId,
  defineApp,
} from '../app-manifest';

export const nutritionApp =
  defineApp({
    id:
      createAppId(
        'nutrition',
      ),

    name:
      'Nutrición',

    description:
      'Dieta, macros y alimentación familiar.',

    route:
      '/nutricion',

    icon:
      Apple,

    tone:
      'mint',

    accessPermission:
      'app.nutrition.access',

    enabled:
      true,

    showOnHome:
      true,

    order:
      35,
  });
