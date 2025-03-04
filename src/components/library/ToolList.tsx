
import { ToolCard } from "@/components/ToolCard";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

interface Tool {
  id: string;
  name: string;
  description: string;
  image_url: string;
  profiles: {
    username: string | null;
    email: string | null;
  };
  status: 'available' | 'requested' | 'checked_out';
}

interface ToolListProps {
  tools: Tool[] | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

export const ToolList = ({ 
  tools, 
  isLoading, 
  isAuthenticated,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage
}: ToolListProps) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage?.();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            id={tool.id}
            name={tool.name}
            description={tool.description}
            imageUrl={tool.image_url || "/placeholder.svg"}
            owner={tool.profiles?.username || tool.profiles?.email?.split('@')[0] || 'Anonymous'}
            status={tool.status}
            requiresAuth={!isAuthenticated}
          />
        ))}
      </div>
      
      {/* Intersection Observer target */}
      {hasNextPage && (
        <div 
          ref={ref} 
          className="h-10 flex items-center justify-center mt-6"
        >
          {isFetchingNextPage ? (
            <div className="text-gray-500">Loading more...</div>
          ) : null}
        </div>
      )}
    </>
  );
};
