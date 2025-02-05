
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  owner: string;
  isAvailable: boolean;
  onRequestCheckout?: () => void;
}

export const ToolCard = ({
  id,
  name,
  description,
  imageUrl,
  owner,
  isAvailable,
  onRequestCheckout,
}: ToolCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

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
          {isAvailable && onRequestCheckout && (
            <Button
              variant="default"
              size="sm"
              onClick={onRequestCheckout}
              className="bg-accent hover:bg-accent/90"
            >
              Request
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
