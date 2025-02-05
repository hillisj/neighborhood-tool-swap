import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";

interface ToolCardActionsProps {
  isOwner: boolean;
  toolId: string;
  toolStatus: "available" | "requested" | "checked_out";
  isRequesting: boolean;
  requiresAuth?: boolean;
  onRequestCheckout: (e: React.MouseEvent) => void;
}

export const ToolCardActions = ({
  isOwner,
  toolId,
  toolStatus,
  isRequesting,
  requiresAuth,
  onRequestCheckout,
}: ToolCardActionsProps) => {
  const navigate = useNavigate();

  if (isOwner) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/tool/${toolId}`);
        }}
        className="bg-accent hover:bg-accent/90"
      >
        <Wrench className="mr-2 h-4 w-4" />
        Manage
      </Button>
    );
  }

  // Only show the request button if the tool is available
  // and there are no pending requests (status !== 'requested')
  if (toolStatus === "available") {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={onRequestCheckout}
        disabled={isRequesting}
        className="bg-accent hover:bg-accent/90"
      >
        {isRequesting 
          ? "Requesting..." 
          : requiresAuth 
            ? "Sign in to Request" 
            : "Request"}
      </Button>
    );
  }

  return null;
};