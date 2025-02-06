import { Tables } from "@/integrations/supabase/types";
import { useToolActions } from "@/hooks/useToolActions";
import { RequestToolButton } from "./RequestToolButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRequests } from "./UserRequests";
import { ToolHeader } from "./ToolHeader";
import { OwnerActions } from "./OwnerActions";

interface ToolContentProps {
  tool: Tables<"tools"> & {
    profiles: {
      username: string | null;
      email: string | null;
    } | null;
  };
  requests: (Tables<"tool_requests"> & {
    profiles: {
      username: string | null;
      email: string | null;
      avatar_url: string | null;
    } | null;
  })[];
  activeCheckout: Tables<"tool_requests"> & {
    profiles: {
      username: string | null;
      email: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
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
        <UserRequests requests={userRequests} toolName={tool.name} />
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