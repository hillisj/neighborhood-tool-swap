interface ToolImageProps {
  imageUrl: string | null;
  name: string;
}

export const ToolImage = ({ imageUrl, name }: ToolImageProps) => {
  return (
    <img
      src={imageUrl || "/placeholder.svg"}
      alt={name}
      className="w-full h-64 object-cover"
    />
  );
};