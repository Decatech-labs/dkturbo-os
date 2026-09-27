'use client';

import {
  Lock,
  Pencil,
} from 'lucide-react';

import {
  useTrainingMobileEditMode,
  useTrainingMobileMode,
} from './use-training-mobile-mode';

interface TrainingMobileEditToggleProps {
  canWrite:
    boolean;
}

export function TrainingMobileEditToggle({
  canWrite,
}: TrainingMobileEditToggleProps) {

  const mobile =
    useTrainingMobileMode();

  const {
    enabled,
    setEnabled,
  } =
    useTrainingMobileEditMode();

  if (
    !mobile ||
    !canWrite
  ) {
    return null;
  }

  return (
    <button
      type="button"
      className={[
        'training-mobile-edit-toggle',

        enabled
          ? 'training-mobile-edit-toggle-active'
          : '',
      ]
        .filter(
          Boolean,
        )
        .join(
          ' ',
        )}
      aria-pressed={
        enabled
      }
      onClick={() => {
        setEnabled(
          !enabled,
        );
      }}
    >

      {enabled
        ? (
          <Lock />
        )
        : (
          <Pencil />
        )}

      <span>
        {enabled
          ? 'Bloquear edición'
          : 'Poder editar'}
      </span>

    </button>
  );
}
