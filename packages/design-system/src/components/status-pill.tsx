export type StatusPillTone =
  | 'success'
  | 'warning'
  | 'neutral';

export interface StatusPillProps {
  label: string;
  tone: StatusPillTone;
}

export const StatusPill = ({
  label,
  tone,
}: StatusPillProps) => (
  <span
    className={`dk-status-pill dk-status-pill-${tone}`}
  >
    <span
      className="dk-status-pill-dot"
      aria-hidden="true"
    />

    {label}
  </span>
);
