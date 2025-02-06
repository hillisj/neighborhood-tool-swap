import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useToolRequest = (toolId: string) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleRequestCheckout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
        .eq('tool_id', toolId)
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
          tool_id: toolId,
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
        queryClient.invalidateQueries({ queryKey: ['tools'] });
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsRequesting(false);
    }
  };

  return { isRequesting, handleRequestCheckout };
};