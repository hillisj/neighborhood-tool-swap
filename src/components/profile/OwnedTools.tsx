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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Your Tools</h2>
      <div className="grid gap-4">
        {ownedTools?.map((tool) => (
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
        {ownedTools?.length === 0 && (
          <p className="text-center text-gray-500">
            You haven't added any tools yet.
          </p>
        )}
      </div>
    </div>
  );
};