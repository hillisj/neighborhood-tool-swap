import { Tables } from "@/integrations/supabase/types";
import { ToolDetailInfo } from "./ToolDetailInfo";
import { ToolRequests } from "./ToolRequests";
import { CurrentCheckout } from "./CurrentCheckout";
import { DeleteToolDialog } from "./DeleteToolDialog";
import { ToolImage } from "./ToolImage";
import { useToolActions } from "@/hooks/useToolActions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

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
  const [isRequesting, setIsRequesting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    handleMarkReturned,
    handleApproveRequest,
    handleRejectRequest,
    handleDeleteTool,
  } = useToolActions(tool.id);

  const handleRequestCheckout = async () => {
    if (requiresAuth) {
      toast.error("Please sign in to request tools");
      navigate('/auth');
      return;
    }

    try {
      setIsRequesting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to request tools");
        navigate('/auth');
        return;
      }

      const { data: activeRequest } = await supabase
        .from('tool_requests')
        .select('status')
        .eq('tool_id', tool.id)
        .eq('requester_id', user.id)
        .in('status', ['pending', 'approved'])
        .maybeSingle();

      if (activeRequest) {
        const message = activeRequest.status === 'pending'
          ? "You already have a pending request for this tool"
          : "You currently have this tool checked out";
        toast.error(message);
        return;
      }

      const { error } = await supabase
        .from('tool_requests')
        .insert({
          tool_id: tool.id,
          requester_id: user.id,
          status: 'pending'
        });

      if (error) {
        if (error.message.includes('violates row-level security')) {
          toast.error("You cannot request your own tools");
        } else {
          throw error;
        }
      } else {
        toast.success("Request sent successfully");
        queryClient.invalidateQueries({ queryKey: ['tool-requests', tool.id] });
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsRequesting(false);
    }
  };

  // Only show the request button if the user is not the owner,
  // the tool is available, and there are no pending requests
  const showRequestButton = !isOwner && tool.status === 'available' && !hasPendingRequests;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <ToolImage imageUrl={tool.image_url} name={tool.name} />
      
      <ToolDetailInfo tool={tool} hasPendingRequests={hasPendingRequests} />

      {showRequestButton && (
        <div className="px-6 pb-6">
          <Button
            variant="default"
            onClick={handleRequestCheckout}
            disabled={isRequesting}
            className="w-full bg-accent hover:bg-accent/90"
          >
            {isRequesting 
              ? "Requesting..." 
              : requiresAuth 
                ? "Sign in to Request" 
                : "Request"}
          </Button>
        </div>
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

      {isOwner && (
        <div className="p-6 border-t bg-red-50">
          <h2 className="text-lg font-semibold mb-4 text-red-700">Danger Zone</h2>
          <DeleteToolDialog onDelete={handleDeleteTool} />
        </div>
      )}
    </div>
  );
};