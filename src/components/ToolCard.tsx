import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ToolImage } from "./tool-card/ToolImage";
import { ToolCardActions } from "./tool-card/ToolCardActions";
import { ToolOwner } from "./tool-card/ToolOwner";
import { useToolRequest } from "./tool-card/useToolRequest";
import { useToolOwnership } from "./tool-card/useToolOwnership";

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
  const navigate = useNavigate();
  const { isOwner } = useToolOwnership(owner);
  const { isRequesting, handleRequestCheckout } = useToolRequest(id);

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
          <ToolOwner owner={owner} />
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