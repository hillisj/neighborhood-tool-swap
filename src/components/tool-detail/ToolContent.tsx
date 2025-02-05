import { Tables } from "@/integrations/supabase/types";
import { ToolDetailInfo } from "./ToolDetailInfo";
import { ToolRequests } from "./ToolRequests";
import { CurrentCheckout } from "./CurrentCheckout";
import { ToolImage } from "./ToolImage";
import { useToolActions } from "@/hooks/useToolActions";
import { RequestToolButton } from "./RequestToolButton";
import { DangerZone } from "./DangerZone";

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

  // Only show the request button if the user is not the owner,
  // the tool is available, and there are no pending requests
  const showRequestButton = !isOwner && tool.status === 'available' && !hasPendingRequests;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <ToolImage imageUrl={tool.image_url} name={tool.name} />
      
      <ToolDetailInfo tool={tool} hasPendingRequests={hasPendingRequests} />

      {showRequestButton && (
        <RequestToolButton
          toolId={tool.id}
          requiresAuth={requiresAuth}
        />
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