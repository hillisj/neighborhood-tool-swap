import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";

interface ItemCardActionsProps {
  isOwner: boolean;
  itemId: string;
  itemStatus: "available" | "requested" | "checked_out";
  isRequesting: boolean;
  requiresAuth?: boolean;
  onRequestCheckout: (e: React.MouseEvent) => void;
}

export const ItemCardActions = ({
  isOwner,
  itemId,
  itemStatus,
  isRequesting,
  requiresAuth,
  onRequestCheckout,
}: ItemCardActionsProps) => {
  const navigate = useNavigate();

  if (isOwner) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/item/${itemId}`);
        }}
        className="bg-accent hover:bg-accent/90"
      >
        <Wrench className="mr-2 h-4 w-4" />
        Manage
      </Button>
    );
  }

  if (itemStatus === "available") {
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