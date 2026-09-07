import {
  Shield,
} from 'lucide-react';

import {
  createAppId,
  defineApp,
} from '../app-manifest';

export const securityApp =
  defineApp({
    id: createAppId(
      'security',
    ),

    name: 'Seguridad',

    description:
      'Protección, accesos y revisiones.',

    route: '/seguridad',

    icon: Shield,

    tone: 'rose',

    accessPermission:
      'app.security.access',

    enabled: true,

    showOnHome: true,

    order: 70,
  });
