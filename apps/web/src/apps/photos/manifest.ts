import {
  ImageIcon,
} from 'lucide-react';

import {
  createAppId,
  defineApp,
} from '../app-manifest';

export const photosApp =
  defineApp({
    id: createAppId(
      'photos',
    ),

    name: 'Fotos',

    description:
      'Biblioteca familiar y recuerdos.',

    route: '/fotos',

    icon: ImageIcon,

    tone: 'peach',

    accessPermission:
      'app.photos.access',

    enabled: true,

    showOnHome: true,

    order: 50,
  });
