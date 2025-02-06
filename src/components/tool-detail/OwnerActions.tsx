import { Tables } from "@/integrations/supabase/types";
import { CurrentCheckout } from "./CurrentCheckout";
import { ToolRequests } from "./ToolRequests";
import { DangerZone } from "./DangerZone";

interface OwnerActionsProps {
  tool: Tables<"tools">;
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
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onMarkReturned: (id: string) => void;
  onDeleteTool: () => void;
}

export const OwnerActions = ({ 
  tool,
  requests,
  activeCheckout,
  onApproveRequest,
  onRejectRequest,
  onMarkReturned,
  onDeleteTool,
}: OwnerActionsProps) => {
  return (
    <>
      {tool.status === 'checked_out' && activeCheckout && (
        <CurrentCheckout
          checkout={activeCheckout}
          onMarkReturned={() => onMarkReturned(activeCheckout.id)}
        />
      )}

      {requests && requests.length > 0 && (
        <ToolRequests
          requests={requests}
          onApprove={onApproveRequest}
          onReject={onRejectRequest}
          onMarkReturned={onMarkReturned}
          toolName={tool.name}
        />
      )}

      <DangerZone onDelete={onDeleteTool} />
    </>
  );
};