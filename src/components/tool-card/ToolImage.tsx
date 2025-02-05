import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type ToolStatus = "available" | "requested" | "checked_out";

interface ToolImageProps {
  imageUrl: string;
  name: string;
  status: ToolStatus;
}

export const ToolImage = ({ imageUrl, name, status }: ToolImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

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