
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
  createdAt?: string;
  updatedAt?: string;
  returnDate?: string;
  showActions?: boolean;
  showRequester?: boolean;
}

export const ToolRequest = ({
  requesterName,
  status,
  dueDate,
  avatarUrl,
  onApprove,
  onReject,
  createdAt,
  updatedAt,
  returnDate,
  showActions = true,
  showRequester = true,
}: ToolRequestProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {showRequester && (
            <Avatar>
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{requesterName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div>
            {showRequester && (
              <p className="text-base text-gray-600">Requested by: {requesterName}</p>
            )}
            {createdAt && (
              <p className="text-base text-gray-600">
                <span className="font-bold">Requested:</span> {format(new Date(createdAt), "MMM d, yyyy")}
              </p>
            )}
            {status === 'approved' && updatedAt && (
              <p className="text-base text-gray-600">
                <span className="font-bold">Checked out:</span> {format(new Date(updatedAt), "MMM d, yyyy")}
              </p>
            )}
            {dueDate && (
              <p className="text-base text-gray-600">
                <span className="font-bold">Due:</span> {format(new Date(dueDate), "MMM d, yyyy")}
              </p>
            )}
            {returnDate && (
              <p className="text-base text-gray-600">
                <span className="font-bold">Returned:</span> {format(new Date(returnDate), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {showActions && status === "pending" && (
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
