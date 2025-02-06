import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useToolActions = (id: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleMarkReturned = async (checkoutId: string) => {
    const { error } = await supabase
      .from('tool_requests')
      .update({ 
        status: 'returned',
        return_date: new Date().toISOString()
      })
      .eq('id', checkoutId);

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

  const handleCancelRequest = async (requestId: string) => {
    // First get the tool request to check if it's the only pending request
    const { data: request, error: requestError } = await supabase
      .from('tool_requests')
      .select('tool_id')
      .eq('id', requestId)
      .single();

    if (requestError) {
      toast.error("Failed to fetch request details");
      return;
    }

    // Get all pending requests for this tool
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('tool_requests')
      .select('id')
      .eq('tool_id', request.tool_id)
      .eq('status', 'pending');

    if (pendingError) {
      toast.error("Failed to check pending requests");
      return;
    }

    // If this is the only pending request, update the tool status to available
    if (pendingRequests.length === 1) {
      const { error: toolError } = await supabase
        .from('tools')
        .update({ status: 'available' })
        .eq('id', request.tool_id);

      if (toolError) {
        toast.error("Failed to update tool status");
        return;
      }
    }

    // Delete the request
    const { error: deleteError } = await supabase
      .from('tool_requests')
      .delete()
      .eq('id', requestId);

    if (deleteError) {
      toast.error("Failed to cancel request");
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ['tool', id] });
    queryClient.invalidateQueries({ queryKey: ['tool-requests', id] });
    queryClient.invalidateQueries({ queryKey: ['tools'] });
    
    toast.success("Request cancelled successfully");
  };

  const handleDeleteTool = async () => {
    // First delete any associated requests
    const { error: requestsError } = await supabase
      .from('tool_requests')
      .delete()
      .eq('tool_id', id);

    if (requestsError) {
      toast.error("Failed to delete tool requests");
      return;
    }

    // Then delete the tool
    const { error: toolError } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (toolError) {
      if (toolError.code === '42501') {
        toast.error("You don't have permission to delete this tool");
      } else {
        toast.error("Failed to delete tool. Please try again.");
      }
      return;
    }
    
    toast.success("Tool deleted successfully");
    queryClient.invalidateQueries({ queryKey: ['tools'] });
    navigate('/profile');
  };

  return {
    handleMarkReturned,
    handleApproveRequest,
    handleRejectRequest,
    handleCancelRequest,
    handleDeleteTool,
  };
};