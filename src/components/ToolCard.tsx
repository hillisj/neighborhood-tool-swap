import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ToolImage } from "./tool-card/ToolImage";
import { ToolCardActions } from "./tool-card/ToolCardActions";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

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
  const [ownerAvatar, setOwnerAvatar] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchOwnerAvatar = async () => {
      const ownerUsername = owner.split('@')[0];
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .or(`username.eq.${ownerUsername},email.ilike.${ownerUsername}@%`)
        .single();

      if (profile) {
        setOwnerAvatar(profile.avatar_url);
      }
    };

    fetchOwnerAvatar();
  }, [owner]);

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

      const { data: activeRequest } = await supabase
        .from('tool_requests')
        .select('status')
        .eq('tool_id', id)
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
        status={status}
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={ownerAvatar || ''}
                alt={owner}
                className="object-cover"
              />
              <AvatarFallback>
                <User className="h-3 w-3 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-500">Owner: {owner}</p>
          </div>
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