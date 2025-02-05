import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ToolDetailHeader } from "@/components/tool-detail/ToolDetailHeader";
import { ToolDetailSkeleton } from "@/components/tool-detail/ToolDetailSkeleton";
import { ToolDetailInfo } from "@/components/tool-detail/ToolDetailInfo";
import { ToolRequests } from "@/components/tool-detail/ToolRequests";
import { CurrentCheckout } from "@/components/tool-detail/CurrentCheckout";
import { DeleteToolDialog } from "@/components/tool-detail/DeleteToolDialog";
import { ToolImage } from "@/components/tool-detail/ToolImage";
import { BottomNav } from "@/components/BottomNav";
import { useToolDetail } from "@/hooks/useToolDetail";
import { useToolRequests } from "@/hooks/useToolRequests";
import { useActiveCheckout } from "@/hooks/useActiveCheckout";

const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { tool, loadingTool } = useToolDetail(id!);
  const { requests } = useToolRequests(id!);
  const { activeCheckout } = useActiveCheckout(id!, tool?.status || '');

  const hasPendingRequests = requests.some(request => request.status === 'pending');
  const isOwner = currentUser?.id === tool?.owner_id;

  const handleMarkReturned = async () => {
    if (!activeCheckout) return;
    
    const { error } = await supabase
      .from('tool_requests')
      .update({ 
        status: 'returned',
        return_date: new Date().toISOString()
      })
      .eq('id', activeCheckout.id);

    if (error) {
      toast.error("Failed to mark tool as returned");
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ['tool', id] });
    queryClient.invalidateQueries({ queryKey: ['tool-requests', id] });
    queryClient.invalidateQueries({ queryKey: ['active-checkout', id] });
    
    toast.success("Tool marked as returned successfully");
  };

  const handleApproveRequest = async (requestId: string) => {
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { error: approvalError } = await supabase
      .from('tool_requests')
      .update({ 
        status: 'approved',
        due_date: dueDate
      })
      .eq('id', requestId);

    if (approvalError) {
      toast.error("Failed to approve request");
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ['tool', id] });
    queryClient.invalidateQueries({ queryKey: ['tool-requests', id] });
    queryClient.invalidateQueries({ queryKey: ['active-checkout', id] });
    
    toast.success("Request approved successfully");
  };

  const handleRejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('tool_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      toast.error("Failed to reject request");
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ['tool', id] });
    queryClient.invalidateQueries({ queryKey: ['tool-requests', id] });
    
    toast.success("Request rejected successfully");
  };

  const handleDeleteTool = async () => {
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete tool");
      return;
    }
    
    toast.success("Tool deleted successfully");
    navigate('/profile');
  };

  if (loadingTool) {
    return (
      <>
        <ToolDetailSkeleton />
        <BottomNav />
      </>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">Tool not found</h1>
          <button onClick={() => navigate(-1)}>Go back</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <ToolDetailHeader />

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ToolImage imageUrl={tool.image_url} name={tool.name} />
          
          <ToolDetailInfo tool={tool} hasPendingRequests={hasPendingRequests} />

          {isOwner && tool.status === 'checked_out' && activeCheckout && (
            <CurrentCheckout
              checkout={activeCheckout}
              onMarkReturned={handleMarkReturned}
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

          {isOwner && <DeleteToolDialog onDelete={handleDeleteTool} />}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ToolDetail;