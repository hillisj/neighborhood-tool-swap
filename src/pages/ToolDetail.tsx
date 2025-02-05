import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToolDetailHeader } from "@/components/tool-detail/ToolDetailHeader";
import { ToolDetailSkeleton } from "@/components/tool-detail/ToolDetailSkeleton";
import { ToolDetailInfo } from "@/components/tool-detail/ToolDetailInfo";
import { ToolRequests } from "@/components/tool-detail/ToolRequests";

const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tool, isLoading: loadingTool } = useQuery({
    queryKey: ['tool', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select(`
          *,
          profiles:owner_id (
            username,
            email
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: requests, isLoading: loadingRequests } = useQuery({
    queryKey: ['tool-requests', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tool_requests')
        .select(`
          *,
          profiles:requester_id (
            username,
            email,
            avatar_url
          )
        `)
        .eq('tool_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
    
    toast.success("Request rejected successfully");
  };

  const handleMarkReturned = async (requestId: string) => {
    const returnDate = new Date().toISOString();
    
    const { error } = await supabase
      .from('tool_requests')
      .update({ 
        status: 'returned',
        return_date: returnDate
      })
      .eq('id', requestId);

    if (error) {
      toast.error("Failed to mark tool as returned");
      return;
    }
    
    toast.success("Tool marked as returned successfully");
  };

  if (loadingTool) {
    return <ToolDetailSkeleton />;
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">Tool not found</h1>
          <Button onClick={() => navigate(-1)}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === tool.owner_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <ToolDetailHeader />

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img
            src={tool.image_url || "/placeholder.svg"}
            alt={tool.name}
            className="w-full h-64 object-cover"
          />
          
          <ToolDetailInfo tool={tool} />

          {isOwner && requests && requests.length > 0 && (
            <ToolRequests
              requests={requests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onMarkReturned={handleMarkReturned}
              toolName={tool.name}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolDetail;
