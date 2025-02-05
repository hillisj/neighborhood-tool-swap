import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RequestStatus } from "./RequestStatus";

interface ToolRequestProps {
  toolName: string;
  requesterName: string;
  status: "pending" | "approved" | "rejected" | "returned";
  dueDate?: string;
  avatarUrl?: string;
  onApprove?: () => void;
  onReject?: () => void;
  updatedAt?: string;
}

export const ToolRequest = ({
  requesterName,
  status,
  dueDate,
  avatarUrl,
  onApprove,
  onReject,
  updatedAt,
}: ToolRequestProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{requesterName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-600">Requested by: {requesterName}</p>
            {dueDate && (
              <p className="text-sm text-gray-600">
                Due: {format(new Date(dueDate), "MMM d, yyyy")}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <RequestStatus status={status} />
              {status !== 'pending' && updatedAt && (
                <p className="text-sm text-gray-500">
                  on {format(new Date(updatedAt), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
        </div>
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
    </Card>
  );
};