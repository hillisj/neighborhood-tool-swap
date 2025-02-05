
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RequestStatus } from "@/components/RequestStatus";
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";

interface ToolRequestProps {
  toolName: string;
  requesterName: string;
  status: "pending" | "approved" | "rejected" | "returned";
  dueDate?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onMarkReturned?: () => void;
}

export const ToolRequest = ({
  toolName,
  requesterName,
  status,
  dueDate,
  onApprove,
  onReject,
  onMarkReturned,
}: ToolRequestProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{toolName}</h3>
          <p className="text-sm text-gray-600">Requested by: {requesterName}</p>
          {dueDate && (
            <p className="text-sm text-gray-600">
              Due: {format(new Date(dueDate), "MMM d, yyyy")}
            </p>
          )}
        </div>
        <RequestStatus status={status} />
      </div>
      
      {status === "pending" && (
        <div className="flex gap-2 mt-4">
          <Button
            onClick={onApprove}
            className="flex items-center gap-1"
            variant="default"
            size="sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </Button>
          <Button
            onClick={onReject}
            className="flex items-center gap-1"
            variant="destructive"
            size="sm"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
        </div>
      )}
      
      {status === "approved" && onMarkReturned && (
        <Button
          onClick={onMarkReturned}
          className="mt-4"
          variant="secondary"
          size="sm"
        >
          Mark as Returned
        </Button>
      )}
    </Card>
  );
};
