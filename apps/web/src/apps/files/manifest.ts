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

    accessPermission:
      'app.files.access',

    enabled: true,

    showOnHome: true,

    order: 40,
  });
