import {
  Users,
} from 'lucide-react';

import {
  createAppId,
  defineApp,
} from '../app-manifest';

export const familyApp =
  defineApp({
    id: createAppId(
      'family',
    ),

    name: 'Familia',

    description:
      'Personas, permisos y acceso.',

    route: '/familia',

    icon: Users,

    tone: 'lavender',

    enabled: true,

    showOnHome: true,

    order: 20,
  });
