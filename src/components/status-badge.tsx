import { Clock } from "lucide-react";
import type { Availability } from "@/lib/resources";
import { cn } from "@/lib/utils";

const styles: Record<Availability["status"], string> = {
  OPEN: "bg-ok-soft text-ok",
  SOON: "bg-amber-soft text-warn",
  CLOSED: "bg-closed-soft text-closed",
  UNKNOWN: "bg-closed-soft text-closed",
};

export function StatusBadge({ avail, className }: { avail: Availability; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold",
        styles[avail.status],
        className,
      )}
    >
      <Clock className="size-3.5" aria-hidden />
      {avail.label}
    </span>
  );
}
