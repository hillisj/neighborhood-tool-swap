
import { Badge } from "@/components/ui/badge";

type RequestStatus = "pending" | "approved" | "rejected" | "returned";

interface RequestStatusProps {
  status: RequestStatus;
}

export const RequestStatus = ({ status }: RequestStatusProps) => {
  const variants: Record<RequestStatus, "default" | "success" | "destructive" | "secondary"> = {
    pending: "default",
    approved: "success",
    rejected: "destructive",
    returned: "secondary",
  };

  const labels: Record<RequestStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    returned: "Returned",
  };

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
};
