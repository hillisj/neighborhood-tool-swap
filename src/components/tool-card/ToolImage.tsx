import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ToolImageProps {
  imageUrl: string;
  name: string;
  status: "available" | "requested" | "checked_out";
}

export const ToolImage = ({ imageUrl, name, status }: ToolImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getStatusBadge = (status: 'available' | 'requested' | 'checked_out') => {
    const styles = {
      available: "bg-green-100 text-green-800",
      requested: "bg-yellow-100 text-yellow-800",
      checked_out: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      available: "Available",
      requested: "Requested",
      checked_out: "Checked Out"
    };

    return (
      <Badge className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
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
        {getStatusBadge(status)}
      </div>
    </div>
  );
};