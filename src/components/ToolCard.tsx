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
  const [isOwner, setIsOwner] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const checkOwnership = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, email')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          const ownerUsername = owner.split('@')[0]; // Handle email case
          setIsOwner(
            profile.username === owner || 
            profile.email?.split('@')[0] === ownerUsername
          );
        }
      }
    };
    
    checkOwnership();
  }, [owner]);

  const handleRequestCheckout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (requiresAuth) {
      toast.error("Please sign in to request items");
      navigate('/auth');
      return;
    }

    try {
      setIsRequesting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to request items");
        navigate('/auth');
        return;
      }

      const { data: activeRequest } = await supabase
        .from('item_requests')
        .select('status')
        .eq('item_id', id)
        .eq('requester_id', user.id)
        .in('status', ['pending', 'approved'])
        .maybeSingle();

      if (activeRequest) {
        const message = activeRequest.status === 'pending'
          ? "You already have a pending request for this item"
          : "You currently have this item checked out";
        toast.error(message);
        return;
      }

      const { error } = await supabase
        .from('item_requests')
        .insert({
          item_id: id,
          requester_id: user.id,
          status: 'pending'
        });

      if (error) {
        if (error.message.includes('violates row-level security')) {
          toast.error("You cannot request your own items");
        } else {
          throw error;
        }
      } else {
        toast.success("Request sent successfully");
        queryClient.invalidateQueries({ queryKey: ['items'] });
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/item/${id}`);
  };

  return (
    <Card 
      className="overflow-hidden animate-fadeIn cursor-pointer hover:shadow-md transition-shadow" 
      onClick={handleCardClick}
    >
      <ToolImage
        imageUrl={imageUrl}
        name={name}
        status={status}
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Owner: {owner}</p>
          <ToolCardActions
            isOwner={isOwner}
            toolId={id}
            toolStatus={status}
            isRequesting={isRequesting}
            requiresAuth={requiresAuth}
            onRequestCheckout={handleRequestCheckout}
          />
        </div>
      </div>
    </Card>
  );
};