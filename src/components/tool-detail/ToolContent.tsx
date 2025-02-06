import { Tables } from "@/integrations/supabase/types";
import { ToolDetailInfo } from "./ToolDetailInfo";
import { ToolRequests } from "./ToolRequests";
import { CurrentCheckout } from "./CurrentCheckout";
import { ToolImage } from "./ToolImage";
import { useToolActions } from "@/hooks/useToolActions";
import { RequestToolButton } from "./RequestToolButton";
import { DangerZone } from "./DangerZone";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRequests } from "./UserRequests";

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

  // Get the current user to check for their pending requests
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Check if the current user has a pending request
  const hasUserPendingRequest = currentUser && requests.some(
    request => request.requester_id === currentUser.id && request.status === 'pending'
  );

  // Filter requests for the current user
  const userRequests = currentUser 
    ? requests.filter(request => request.requester_id === currentUser.id)
    : [];

  // Only show the request button if:
  // 1. User is not the owner
  // 2. Tool is available
  // 3. User doesn't have a pending request
  const showRequestButton = !isOwner && 
    tool.status === 'available' && 
    !hasUserPendingRequest;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <ToolImage 
        imageUrl={tool.image_url} 
        name={tool.name} 
        status={tool.status}
        hasPendingRequests={hasPendingRequests}
      />
      
      <ToolDetailInfo 
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

      {isOwner && tool.status === 'checked_out' && activeCheckout && (
        <CurrentCheckout
          checkout={activeCheckout}
          onMarkReturned={() => handleMarkReturned(activeCheckout.id)}
        />
      )}

      {isOwner && requests && requests.length > 0 && (
        <ToolRequests
          requests={requests}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          onMarkReturned={handleMarkReturned}
          toolName={tool.name}
        />
      )}

      {isOwner && <DangerZone onDelete={handleDeleteTool} />}
    </div>
  );
};