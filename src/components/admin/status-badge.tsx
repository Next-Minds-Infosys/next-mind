import { SubmissionStatus } from "@/generated/prisma/enums";
import { Badge, type BadgeProps } from "@/components/ui/badge";

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; variant: BadgeProps["variant"] }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  CONTACTED: { label: "Contacted", variant: "blue" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "outline" },
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { STATUS_CONFIG };
