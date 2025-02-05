import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ToolImage } from "./tool-card/ToolImage";
import { ToolCardActions } from "./tool-card/ToolCardActions";

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  owner: string;
  status: 'available' | 'requested' | 'checked_out';
  requiresAuth?: boolean;
}

export const ToolCard = ({
  id,
  name,
  description,
  imageUrl,
  owner,
  status,
  requiresAuth,
}: ToolCardProps) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [toolStatus, setToolStatus] = useState(status);
  const [isOwner, setIsOwner] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const checkToolStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tool } = await supabase
        .from('tools')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      setIsOwner(tool?.owner_id === user.id);
    };

    checkToolStatus();
  }, [id]);

  const handleRequestCheckout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

      // Check for any existing request for this tool/user combination
      const { data: existingRequest } = await supabase
        .from('tool_requests')
        .select('status')
        .eq('tool_id', id)
        .eq('requester_id', user.id)
        .maybeSingle();

      if (existingRequest) {
        let message = "";
        switch (existingRequest.status) {
          case 'pending':
            message = "You already have a pending request for this tool";
            break;
          case 'approved':
            message = "You currently have this tool checked out";
            break;
          case 'rejected':
            message = "Your previous request was rejected. Please contact the owner";
            break;
          case 'returned':
            message = "You have previously borrowed this tool. Please submit a new request";
            break;
          default:
            message = "You cannot request this tool at this time";
        }
        toast.error(message);
        return;
      }

      const { error } = await supabase
        .from('tool_requests')
        .insert({
          tool_id: id,
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
        setToolStatus("requested");
        queryClient.invalidateQueries({ queryKey: ['tools'] });
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/tool/${id}`);
  };

  return (
    <Card 
      className="overflow-hidden animate-fadeIn cursor-pointer hover:shadow-md transition-shadow" 
      onClick={handleCardClick}
    >
      <ToolImage
        imageUrl={imageUrl}
        name={name}
        status={toolStatus}
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Owner: {owner}</p>
          <ToolCardActions
            isOwner={isOwner}
            toolId={id}
            toolStatus={toolStatus}
            isRequesting={isRequesting}
            requiresAuth={requiresAuth}
            onRequestCheckout={handleRequestCheckout}
          />
        </div>
      </div>
    </Card>
  );
};