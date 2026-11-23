import { ReachableStatus } from "@/constants/validation";

export type StatusStyle = {
  label: string;
  headline: string;
  description: string;
  text: string;
  soft: string;
  dot: string;
  bar: string;
  stroke: string;
};

export const STATUS_STYLES: Record<ReachableStatus, StatusStyle> = {
  [ReachableStatus.SAFE]: {
    label: "Deliverable",
    headline: "This address accepts email",
    description: "The recipient's mail server confirmed the mailbox exists.",
    text: "text-emerald-700",
    soft: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    stroke: "stroke-emerald-500",
  },
  [ReachableStatus.RISKY]: {
    label: "Risky",
    headline: "Deliverable, with a catch",
    description:
      "The address exists but is catch-all, a role inbox, or a disposable provider.",
    text: "text-amber-700",
    soft: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
    stroke: "stroke-amber-500",
  },
  [ReachableStatus.INVALID]: {
    label: "Undeliverable",
    headline: "This address will bounce",
    description: "The mailbox or domain doesn't exist. Remove it from your list.",
    text: "text-rose-700",
    soft: "bg-rose-50 text-rose-700 ring-rose-600/20",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
    stroke: "stroke-rose-500",
  },
  [ReachableStatus.UNKNOWN]: {
    label: "Unknown",
    headline: "We couldn't get a clear answer",
    description:
      "The mail server didn't respond conclusively. Try again later.",
    text: "text-slate-600",
    soft: "bg-slate-100 text-slate-600 ring-slate-500/20",
    dot: "bg-slate-400",
    bar: "bg-slate-300",
    stroke: "stroke-slate-400",
  },
};

export const STATUS_ORDER = [
  ReachableStatus.SAFE,
  ReachableStatus.RISKY,
  ReachableStatus.INVALID,
  ReachableStatus.UNKNOWN,
] as const;
