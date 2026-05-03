import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  if (status === "approved")
    return (
      <Badge className="bg-success/15 text-success border-success/30 gap-1 hover:bg-success/20">
        <CheckCircle2 className="h-3 w-3" /> Approved
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge className="bg-destructive/15 text-destructive border-destructive/30 gap-1 hover:bg-destructive/20">
        <XCircle className="h-3 w-3" /> Rejected
      </Badge>
    );
  return (
    <Badge className="bg-warning/15 text-warning border-warning/30 gap-1 hover:bg-warning/20">
      <Clock className="h-3 w-3" /> Pending
    </Badge>
  );
}
