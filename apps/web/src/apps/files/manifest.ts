import {
  Folder,
} from 'lucide-react';

import {
  createAppId,
  defineApp,
} from '../app-manifest';

export const filesApp =
  defineApp({
    id: createAppId(
      'files',
    ),

    name: 'Archivos',

    description:
      'Documentos, copias y almacenamiento.',

    route: '/archivos',

    icon: Folder,

    tone: 'yellow',

    enabled: true,

    showOnHome: true,

    order: 30,
  });
