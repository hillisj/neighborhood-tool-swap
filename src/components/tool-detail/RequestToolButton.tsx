import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface RequestToolButtonProps {
  toolId: string;
  requiresAuth?: boolean;
}

export const RequestToolButton = ({ toolId, requiresAuth }: RequestToolButtonProps) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
        queryClient.invalidateQueries({ queryKey: ['tool-requests', toolId] });
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
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
  );
};