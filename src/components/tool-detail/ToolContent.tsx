
import { Tables } from "@/integrations/supabase/types";
import { useToolActions } from "@/hooks/useToolActions";
import { RequestToolButton } from "./RequestToolButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BorrowerRequests } from "./BorrowerRequests";
import { ToolHeader } from "./ToolHeader";
import { OwnerActions } from "./OwnerActions";

interface ToolWithProfile extends Tables<"tools"> {
  profiles: {
    username: string | null;
    phone_number: string | null;
  } | null;
}

interface RequestWithProfile extends Tables<"tool_requests"> {
  profiles: {
    username: string | null;
    phone_number: string | null;
    avatar_url: string | null;
  } | null;
}

interface ToolContentProps {
  tool: ToolWithProfile;
  requests: RequestWithProfile[];
  activeCheckout: RequestWithProfile | null;
  isOwner: boolean;
  hasPendingRequests: boolean;
  requiresAuth?: boolean;
}

export const ToolContent = ({ 
  tool, 
  requests, 
  activeCheckout, 
  isOwner, 
  hasPendingRequests,
  requiresAuth,
}: ToolContentProps) => {
  const {
    handleMarkReturned,
    handleApproveRequest,
    handleRejectRequest,
    handleDeleteTool,
  } = useToolActions(tool.id);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const hasUserPendingRequest = currentUser && requests.some(
    request => request.requester_id === currentUser.id && request.status === 'pending'
  );

  const userRequests = currentUser 
    ? requests.filter(request => request.requester_id === currentUser.id)
    : [];

  const showRequestButton = !isOwner && 
    tool.status === 'available' && 
    !hasUserPendingRequest;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <ToolHeader 
        tool={tool}
        hasPendingRequests={hasPendingRequests}
        isOwner={isOwner}
      />

      {showRequestButton && (
        <RequestToolButton
          toolId={tool.id}
          requiresAuth={requiresAuth}
        />
      )}

      {!isOwner && userRequests.length > 0 && (
        <BorrowerRequests requests={userRequests} toolName={tool.name} />
      )}

      {isOwner && (
        <OwnerActions
          tool={tool}
          requests={requests}
          activeCheckout={activeCheckout}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
          onMarkReturned={handleMarkReturned}
          onDeleteTool={handleDeleteTool}
        />
      )}
    </div>
  );
};
