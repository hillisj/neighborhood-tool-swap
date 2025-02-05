
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  owner: string;
  isAvailable: boolean;
}

export const ToolCard = ({
  id,
  name,
  description,
  imageUrl,
  owner,
  isAvailable,
}: ToolCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const queryClient = useQueryClient();

  const handleRequestCheckout = async () => {
    try {
      setIsRequesting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to request tools");
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

  return (
    <Card className="overflow-hidden animate-fadeIn">
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={name}
          className={`object-cover w-full h-full transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg">{name}</h3>
          <Badge variant={isAvailable ? "default" : "secondary"}>
            {isAvailable ? "Available" : "Checked Out"}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Owner: {owner}</p>
          {isAvailable && (
            <Button
              variant="default"
              size="sm"
              onClick={handleRequestCheckout}
              disabled={isRequesting}
              className="bg-accent hover:bg-accent/90"
            >
              {isRequesting ? "Requesting..." : "Request"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
