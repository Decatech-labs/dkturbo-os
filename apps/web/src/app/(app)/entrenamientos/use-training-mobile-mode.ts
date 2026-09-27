'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

const MOBILE_QUERY =
  '(max-width: 760px)';

const EDIT_STORAGE_KEY =
  'dkturbo-training-mobile-edit';

const EDIT_EVENT =
  'dkturbo-training-mobile-edit-change';

export const useTrainingMobileMode =
  (): boolean => {

    const [
      mobile,
      setMobile,
    ] =
      useState(
        true,
      );

    useEffect(
      () => {

        const mediaQuery =
          window.matchMedia(
            MOBILE_QUERY,
          );

        const sync =
          () => {
            setMobile(
              mediaQuery.matches,
            );
          };

        sync();

        mediaQuery.addEventListener(
          'change',
          sync,
        );

        return () => {
          mediaQuery.removeEventListener(
            'change',
            sync,
          );
        };
      },
      [],
    );

    return mobile;
  };

export const useTrainingMobileEditMode =
  (): {
    enabled:
      boolean;

    setEnabled:
      (
        value:
          boolean,
      ) => void;
  } => {

    const [
      enabled,
      setEnabledState,
    ] =
      useState(
        false,
      );

    useEffect(
      () => {

        const sync =
          () => {

            const next =
              sessionStorage.getItem(
                EDIT_STORAGE_KEY,
              ) ===
              'true';

            setEnabledState(
              next,
            );

            document.documentElement.classList.toggle(
              'training-mobile-plan-edit-enabled',
              next,
            );
          };

        sync();

        window.addEventListener(
          EDIT_EVENT,
          sync,
        );

        return () => {
          window.removeEventListener(
            EDIT_EVENT,
            sync,
          );
        };
      },
      [],
    );

    const setEnabled =
      useCallback(
        (
          value:
            boolean,
        ) => {

          sessionStorage.setItem(
            EDIT_STORAGE_KEY,
            value
              ? 'true'
              : 'false',
          );

          document.documentElement.classList.toggle(
            'training-mobile-plan-edit-enabled',
            value,
          );

          setEnabledState(
            value,
          );

          window.dispatchEvent(
            new Event(
              EDIT_EVENT,
            ),
          );
        },
        [],
      );

    return {
      enabled,
      setEnabled,
    };
  };
