
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
      if (approvalError.message.includes('Tool is already checked out')) {
        toast.error("Cannot approve: Tool is currently checked out");
      } else {
        toast.error("Failed to approve request");
      }
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
    handleDeleteTool,
  };
};
