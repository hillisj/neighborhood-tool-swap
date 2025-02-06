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

  const handleDeleteTool = async () => {
    // First check if there are any active requests or checkouts
    const { data: activeRequests, error: checkError } = await supabase
      .from('tool_requests')
      .select('status')
      .eq('tool_id', id)
      .in('status', ['pending', 'approved']);

    if (checkError) {
      toast.error("Failed to check tool status");
      return;
    }

    if (activeRequests && activeRequests.length > 0) {
      toast.error("Cannot delete tool with active requests or checkouts");
      return;
    }

    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '42501') {
        toast.error("You don't have permission to delete this tool");
      } else if (error.code === '23503') {
        toast.error("Cannot delete tool with associated requests");
      } else {
        toast.error(`Error deleting tool: ${error.message}`);
      }
      return;
    }
    
    toast.success("Tool deleted successfully");
    navigate('/profile');
  };

  return {
    handleMarkReturned,
    handleApproveRequest,
    handleRejectRequest,
    handleDeleteTool,
  };
};