
import { ToolCard } from "@/components/ToolCard";

interface Tool {
  id: string;
  name: string;
  description: string;
  image_url: string;
  profiles: {
    username: string | null;
    phone_number: string | null;
  };
  status: 'available' | 'requested' | 'checked_out';
}

interface ToolListProps {
  tools: Tool[] | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const ToolList = ({ tools, isLoading, isAuthenticated }: ToolListProps) => {
  if (isLoading) {
    return <div className="text-center text-gray-500">Loading tools...</div>;
  }

  if (!tools?.length) {
    return (
      <div className="text-center text-gray-500">
        No available tools at the moment. 
        {isAuthenticated ? ' Add one to share!' : ' Sign in to add tools!'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          id={tool.id}
          name={tool.name}
          description={tool.description}
          imageUrl={tool.image_url || "/placeholder.svg"}
          owner={tool.profiles?.username || tool.profiles?.phone_number || 'Anonymous'}
          status={tool.status}
          requiresAuth={!isAuthenticated}
        />
      ))}
    </div>
  );
};
