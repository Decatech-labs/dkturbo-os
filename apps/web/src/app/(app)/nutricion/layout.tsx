import type {
  ReactNode,
} from 'react';

import './nutrition.css';

export default function NutritionLayout({
  children,
}: Readonly<{
  children:
    ReactNode;
}>) {
  return children;
}
