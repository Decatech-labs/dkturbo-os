'use client';

import {
  Check,
  CheckCheck,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useState,
} from 'react';

type ApprovalDecision =
  | 'REJECT'
  | 'APPROVE_ONCE'
  | 'APPROVE_AND_GRANT';

interface ApprovalActionsProps {
  approvalRequestId:
    string;
}

export function ApprovalActions({
  approvalRequestId,
}: ApprovalActionsProps) {
  const router =
    useRouter();

  const [
    pendingDecision,
    setPendingDecision,
  ] =
    useState<
      ApprovalDecision | null
    >(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const decide =
    async (
      decision:
        ApprovalDecision,
    ) => {
      if (
        pendingDecision
      ) {
        return;
      }

      setError(
        null,
      );

      setPendingDecision(
        decision,
      );

      try {
        const response =
          await fetch(
            `/api/family/approval-requests/${approvalRequestId}/decision`,
            {
              method:
                'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  decision,
                }),
            },
          );

        if (
          !response.ok
        ) {
          throw new Error(
            'approval_decision_failed',
          );
        }

        router.refresh();
      } catch {
        setError(
          'No se ha podido guardar la decisión.',
        );

        setPendingDecision(
          null,
        );
      }
    };

  const disabled =
    pendingDecision !==
    null;

  return (
    <div className="family-approval-actions">
      <button
        type="button"
        className="family-action family-action-reject"
        disabled={
          disabled
        }
        onClick={() =>
          void decide(
            'REJECT',
          )
        }
      >
        <X />

        <span>
          {pendingDecision ===
          'REJECT'
            ? 'Rechazando…'
            : 'Rechazar'}
        </span>
      </button>

      <button
        type="button"
        className="family-action family-action-once"
        disabled={
          disabled
        }
        onClick={() =>
          void decide(
            'APPROVE_ONCE',
          )
        }
      >
        <Check />

        <span>
          {pendingDecision ===
          'APPROVE_ONCE'
            ? 'Permitiendo…'
            : 'Permitir esta vez'}
        </span>
      </button>

      <button
        type="button"
        className="family-action family-action-always"
        disabled={
          disabled
        }
        onClick={() =>
          void decide(
            'APPROVE_AND_GRANT',
          )
        }
      >
        <CheckCheck />

        <span>
          {pendingDecision ===
          'APPROVE_AND_GRANT'
            ? 'Concediendo…'
            : 'Permitir siempre'}
        </span>
      </button>

      {error && (
        <div
          className="family-action-error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
