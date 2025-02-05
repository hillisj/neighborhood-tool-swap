import { useState } from "react";

interface ToolImageProps {
  imageUrl: string;
  name: string;
  status: "available" | "requested" | "checked_out";
}

export const ToolImage = ({ imageUrl, name }: ToolImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

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
    </div>
  );
};