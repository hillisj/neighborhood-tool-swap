import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";

export const OwnedTools = () => {
  const { data: ownedTools, isLoading: loadingOwned } = useQuery({
    queryKey: ['owned-tools'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: tools, error: toolsError } = await supabase
        .from('tools')
        .select(`
          *,
          profiles:owner_id (
            username,
            email
          ),
          tool_requests (
            status,
            id
          )
        `)
        .eq('owner_id', user.id);

      if (toolsError) throw toolsError;

      // Process tools to include request status
      return tools.map(tool => ({
        ...tool,
        status: tool.tool_requests?.some(request => request.status === 'pending')
          ? 'requested' as const
          : tool.tool_requests?.some(request => request.status === 'approved')
            ? 'checked_out' as const
            : 'available' as const
      }));
    },
  });

  if (loadingOwned) {
    return <div className="text-center text-gray-500">Loading your tools...</div>;
  }

  // Group tools by status
  const checkedOutTools = ownedTools?.filter(tool => tool.status === 'checked_out') || [];
  const requestedTools = ownedTools?.filter(tool => tool.status === 'requested') || [];
  const availableTools = ownedTools?.filter(tool => tool.status === 'available') || [];

  const renderToolSection = (tools: typeof ownedTools, title: string) => {
    if (!tools || tools.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-600">{title}</h3>
        <div className="grid gap-4">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              name={tool.name}
              description={tool.description}
              imageUrl={tool.image_url || "/placeholder.svg"}
              owner={tool.profiles?.username || tool.profiles?.email?.split('@')[0] || 'Anonymous'}
              status={tool.status}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {checkedOutTools.length === 0 && requestedTools.length === 0 && availableTools.length === 0 ? (
        <p className="text-center text-gray-500">
          You haven't added any tools yet.
        </p>
      ) : (
        <div className="space-y-8">
          {renderToolSection(checkedOutTools, "Checked Out")}
          {renderToolSection(requestedTools, "Requested")}
          {renderToolSection(availableTools, "Available")}
        </div>
      )}
    </div>
  );
};