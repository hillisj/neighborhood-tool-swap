
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  owner: string;
  status: 'available' | 'requested' | 'checked_out';
  requiresAuth?: boolean;
}

type ToolStatus = "available" | "requested" | "checked_out";

export const ToolCard = ({
  id,
  name,
  description,
  imageUrl,
  owner,
  status,
  requiresAuth,
}: ToolCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [toolStatus, setToolStatus] = useState<ToolStatus>(status);
  const [isOwner, setIsOwner] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const checkToolStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if current user is the owner
      const { data: tool } = await supabase
        .from('tools')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      setIsOwner(tool?.owner_id === user.id);
    };

    checkToolStatus();
  }, [id]);

  const getStatusBadge = (status: ToolStatus) => {
    switch (status) {
      case "available":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Available</Badge>;
      case "requested":
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">Requested</Badge>;
      case "checked_out":
        return <Badge variant="secondary">Checked Out</Badge>;
    }
  };

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

      const { error } = await supabase
        .from('tool_requests')
        .insert({
          tool_id: id,
          requester_id: user.id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You already have a pending request for this tool");
        } else if (error.message.includes('violates row-level security')) {
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
    <Card className="overflow-hidden animate-fadeIn cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={name}
          className={`object-cover w-full h-full transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute top-2 right-2">
          {getStatusBadge(toolStatus)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Owner: {owner}</p>
          {isOwner ? (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tool/${id}`);
              }}
              className="bg-accent hover:bg-accent/90"
            >
              Manage Tool
            </Button>
          ) : (
            toolStatus === "available" && (
              <Button
                variant="default"
                size="sm"
                onClick={handleRequestCheckout}
                disabled={isRequesting}
                className="bg-accent hover:bg-accent/90"
              >
                {isRequesting 
                  ? "Requesting..." 
                  : requiresAuth 
                    ? "Sign in to Request" 
                    : "Request"}
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  );
};
