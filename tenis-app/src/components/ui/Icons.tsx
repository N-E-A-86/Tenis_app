import { type SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number };

function svg(
  children: React.ReactNode,
  { size = 24, className, ...props }: Props,
) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

// ── Tennis ball logo icon ──────────────────────────────

export function TennisBallIcon(props: Props) {
  return svg(
    <>
      <circle cx={12} cy={12} r={10} fill="#DDF15E" stroke="#C5D94A" strokeWidth={1} />
      <path
        d="M4.5 8.5C7 10 7 14 4.5 15.5"
        stroke="white"
        strokeWidth={1.8}
        fill="none"
      />
      <path
        d="M19.5 8.5C17 10 17 14 19.5 15.5"
        stroke="white"
        strokeWidth={1.8}
        fill="none"
      />
      <path d="M12 2v20" stroke="white" strokeWidth={1.8} opacity={0.15} />
    </>,
    props,
  );
}

// ── Court surface icons ────────────────────────────────

export function CourtClayIcon(props: Props) {
  return svg(
    <>
      <rect x={4} y={6} width={16} height={12} rx={1} fill="#8B4513" stroke="#A0522D" strokeWidth={0.8} />
      <line x1={12} y1={6} x2={12} y2={18} stroke="white" strokeWidth={0.8} opacity={0.5} />
      <line x1={4} y1={12} x2={20} y2={12} stroke="white" strokeWidth={0.8} opacity={0.4} />
      <line x1={4} y1={9} x2={20} y2={9} stroke="white" strokeWidth={0.5} opacity={0.2} />
      <line x1={4} y1={15} x2={20} y2={15} stroke="white" strokeWidth={0.5} opacity={0.2} />
    </>,
    props,
  );
}

export function CourtHardIcon(props: Props) {
  return svg(
    <>
      <rect x={4} y={6} width={16} height={12} rx={1} fill="#1E3A5F" stroke="#2A5A8F" strokeWidth={0.8} />
      <line x1={12} y1={6} x2={12} y2={18} stroke="white" strokeWidth={0.8} opacity={0.5} />
      <line x1={4} y1={12} x2={20} y2={12} stroke="white" strokeWidth={0.8} opacity={0.4} />
      <line x1={4} y1={9} x2={20} y2={9} stroke="white" strokeWidth={0.5} opacity={0.2} />
      <line x1={4} y1={15} x2={20} y2={15} stroke="white" strokeWidth={0.5} opacity={0.2} />
    </>,
    props,
  );
}

export function CourtGrassIcon(props: Props) {
  return svg(
    <>
      <rect x={4} y={6} width={16} height={12} rx={1} fill="#2E7D32" stroke="#3A9D40" strokeWidth={0.8} />
      <line x1={12} y1={6} x2={12} y2={18} stroke="white" strokeWidth={0.8} opacity={0.5} />
      <line x1={4} y1={12} x2={20} y2={12} stroke="white" strokeWidth={0.8} opacity={0.4} />
      <line x1={4} y1={9} x2={20} y2={9} stroke="white" strokeWidth={0.5} opacity={0.2} />
      <line x1={4} y1={15} x2={20} y2={15} stroke="white" strokeWidth={0.5} opacity={0.2} />
    </>,
    props,
  );
}

export function CourtSyntheticIcon(props: Props) {
  return svg(
    <>
      <rect x={4} y={6} width={16} height={12} rx={1} fill="#4A148C" stroke="#6A1B9A" strokeWidth={0.8} />
      <line x1={12} y1={6} x2={12} y2={18} stroke="white" strokeWidth={0.8} opacity={0.5} />
      <line x1={4} y1={12} x2={20} y2={12} stroke="white" strokeWidth={0.8} opacity={0.4} />
      <line x1={4} y1={9} x2={20} y2={9} stroke="white" strokeWidth={0.5} opacity={0.2} />
      <line x1={4} y1={15} x2={20} y2={15} stroke="white" strokeWidth={0.5} opacity={0.2} />
    </>,
    props,
  );
}

// ── Feature icons ──────────────────────────────────────

export function LightningIcon(props: Props) {
  return svg(
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" stroke="none" />,
    props,
  );
}

export function LockIcon(props: Props) {
  return svg(
    <>
      <rect x={5} y={11} width={14} height={10} rx={2} />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </>,
    props,
  );
}

export function DeviceIcon(props: Props) {
  return svg(
    <>
      <rect x={4} y={4} width={16} height={16} rx={2} />
      <line x1={8} y1={20} x2={16} y2={20} />
      <line x1={12} y1={16} x2={12} y2={20} />
    </>,
    props,
  );
}

// ── Arrow / chevron ────────────────────────────────────

export function ChevronRightIcon(props: Props) {
  return svg(<path d="M9 6l6 6-6 6" />, props);
}

export function CalendarIcon(props: Props) {
  return svg(
    <>
      <rect x={3} y={4} width={18} height={18} rx={2} />
      <line x1={3} y1={10} x2={21} y2={10} />
      <line x1={8} y1={2} x2={8} y2={6} />
      <line x1={16} y1={2} x2={16} y2={6} />
    </>,
    props,
  );
}

export function StarIcon(props: Props) {
  return svg(
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />,
    { ...props, stroke: "none" },
  );
}
