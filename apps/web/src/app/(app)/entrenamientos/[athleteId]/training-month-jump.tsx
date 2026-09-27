'use client';

import {
  Check,
  ChevronDown,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  createPortal,
} from 'react-dom';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from './training-month-jump.module.css';

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

interface TrainingMonthJumpProps {
  year: number;
  monthIndex: number;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
}

const formatMonthKey = (
  year: number,
  monthIndex: number,
): string =>
  `${year}-${String(
    monthIndex + 1,
  ).padStart(2, '0')}`;

export function TrainingMonthJump({
  year,
  monthIndex,
}: TrainingMonthJumpProps) {

  const router =
    useRouter();

  const triggerRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const menuRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    menuPosition,
    setMenuPosition,
  ] =
    useState<MenuPosition | null>(
      null,
    );

  const [
    yearValue,
    setYearValue,
  ] = useState(
    String(year),
  );

  useEffect(
    () => {
      setYearValue(
        String(year),
      );
    },
    [year],
  );

  const navigate = (
    nextYear: number,
    nextMonthIndex: number,
  ) => {

    if (
      !Number.isInteger(
        nextYear,
      ) ||
      nextYear < 1900 ||
      nextYear > 9999
    ) {
      return;
    }

    setOpen(false);

    router.push(
      `?month=${formatMonthKey(
        nextYear,
        nextMonthIndex,
      )}`,
    );

  };

  const positionMenu =
    () => {

      const trigger =
        triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect =
        trigger.getBoundingClientRect();

      setMenuPosition({
        top:
          rect.bottom + 6,

        left:
          rect.left,

        width:
          Math.max(
            rect.width,
            138,
          ),
      });

    };

  useEffect(
    () => {

      if (!open) {
        return;
      }

      positionMenu();

      const onPointerDown = (
        event: PointerEvent,
      ) => {

        const target =
          event.target;

        if (
          !(target instanceof Node)
        ) {
          return;
        }

        if (
          triggerRef.current
            ?.contains(target) ||
          menuRef.current
            ?.contains(target)
        ) {
          return;
        }

        setOpen(false);

      };

      const onKeyDown = (
        event: KeyboardEvent,
      ) => {

        if (
          event.key ===
          'Escape'
        ) {

          setOpen(false);

          triggerRef.current
            ?.focus();

        }

      };

      const onViewportChange =
        () => {
          positionMenu();
        };

      document.addEventListener(
        'pointerdown',
        onPointerDown,
      );

      document.addEventListener(
        'keydown',
        onKeyDown,
      );

      window.addEventListener(
        'resize',
        onViewportChange,
      );

      window.addEventListener(
        'scroll',
        onViewportChange,
        true,
      );

      return () => {

        document.removeEventListener(
          'pointerdown',
          onPointerDown,
        );

        document.removeEventListener(
          'keydown',
          onKeyDown,
        );

        window.removeEventListener(
          'resize',
          onViewportChange,
        );

        window.removeEventListener(
          'scroll',
          onViewportChange,
          true,
        );

      };

    },
    [open],
  );

  const commitYear =
    () => {

      const nextYear =
        Number(yearValue);

      if (
        !Number.isInteger(
          nextYear,
        ) ||
        nextYear < 1900 ||
        nextYear > 9999
      ) {

        setYearValue(
          String(year),
        );

        return;

      }

      if (
        nextYear ===
        year
      ) {

        setYearValue(
          String(year),
        );

        return;

      }

      navigate(
        nextYear,
        monthIndex,
      );

    };

  return (

    <div
      className={
        styles.root
      }
    >

      <button
        ref={
          triggerRef
        }
        type="button"
        className={
          styles.monthButton
        }
        aria-haspopup="listbox"
        aria-expanded={
          open
        }
        onClick={() => {

          if (!open) {
            positionMenu();
          }

          setOpen(
            current =>
              !current,
          );

        }}
      >

        <span>
          {
            MONTHS[
              monthIndex
            ]
          }
        </span>

        <ChevronDown
          aria-hidden="true"
        />

      </button>

      <input
        className={
          styles.yearInput
        }
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={
          yearValue
        }
        aria-label="Seleccionar año"
        onChange={(event) => {

          const value =
            event.target.value;

          if (
            value === '' ||
            /^\d{0,4}$/.test(
              value,
            )
          ) {

            setYearValue(
              value,
            );

          }

        }}
        onBlur={
          commitYear
        }
        onKeyDown={(event) => {

          if (
            event.key ===
            'Enter'
          ) {

            event.preventDefault();

            commitYear();

            event.currentTarget.blur();

          }

          if (
            event.key ===
            'Escape'
          ) {

            setYearValue(
              String(year),
            );

            event.currentTarget.blur();

          }

        }}
      />

      {
        open &&
        menuPosition &&
        createPortal(

          <div
            ref={
              menuRef
            }
            className={
              styles.menu
            }
            role="listbox"
            aria-label="Seleccionar mes"
            style={{
              top:
                menuPosition.top,

              left:
                menuPosition.left,

              width:
                menuPosition.width,
            }}
          >

            {MONTHS.map(
              (
                month,
                index,
              ) => {

                const selected =
                  index ===
                  monthIndex;

                return (

                  <button
                    key={
                      month
                    }
                    type="button"
                    role="option"
                    aria-selected={
                      selected
                    }
                    className={[
                      styles.menuItem,
                      selected
                        ? styles.menuItemSelected
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {

                      navigate(
                        year,
                        index,
                      );

                    }}
                  >

                    <span
                      className={
                        styles.check
                      }
                    >
                      {selected && (
                        <Check />
                      )}
                    </span>

                    <span>
                      {month}
                    </span>

                  </button>

                );

              },
            )}

          </div>,

          document.body,

        )
      }

    </div>

  );

}
