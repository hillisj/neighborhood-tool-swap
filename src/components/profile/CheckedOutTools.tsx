
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";

export const CheckedOutTools = () => {
  const { data: checkedOutTools, isLoading: loadingCheckedOut } = useQuery({
    queryKey: ['checked-out-tools'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('tools')
        .select(`
          *,
          profiles:owner_id (
            username,
            email
          ),
          tool_requests!inner (
            status,
            id
          )
        `)
        .eq('tool_requests.requester_id', user.id)
        .eq('tool_requests.status', 'approved');

      if (error) throw error;
      return data.map(tool => ({
        ...tool,
        status: tool.tool_requests?.some(request => request.status === 'pending')
          ? 'requested' as const
          : tool.tool_requests?.some(request => request.status === 'approved')
            ? 'checked_out' as const
            : 'available' as const
      }));
    },
  });

  const { data: pendingTools, isLoading: loadingPending } = useQuery({
    queryKey: ['pending-tool-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('tools')
        .select(`
          *,
          profiles:owner_id (
            username,
            email
          ),
          tool_requests!inner (
            status,
            id
          )
        `)
        .eq('tool_requests.requester_id', user.id)
        .eq('tool_requests.status', 'pending');

      if (error) throw error;
      return data.map(tool => ({
        ...tool,
        status: tool.tool_requests?.some(request => request.status === 'pending')
          ? 'requested' as const
          : tool.tool_requests?.some(request => request.status === 'approved')
            ? 'checked_out' as const
            : 'available' as const
      }));
    },
  });

  if (loadingCheckedOut || loadingPending) {
    return <div className="text-center text-gray-500">Loading tools...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Borrowed</h2>
        <div className="grid gap-4">
          {checkedOutTools?.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              name={tool.name}
              description={tool.description}
              imageUrl={tool.image_url || "/placeholder.svg"}
              owner={
                tool.profiles?.username || 
                tool.profiles?.email?.split('@')[0] || 
                'Anonymous'
              }
              status={tool.status}
            />
          ))}
          {checkedOutTools?.length === 0 && (
            <p className="text-center text-gray-500">
              You haven't borrowed any tools yet.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Pending Requests</h2>
        <div className="grid gap-4">
          {pendingTools?.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              name={tool.name}
              description={tool.description}
              imageUrl={tool.image_url || "/placeholder.svg"}
              owner={
                tool.profiles?.username || 
                tool.profiles?.email?.split('@')[0] || 
                'Anonymous'
              }
              status={tool.status}
            />
          ))}
          {pendingTools?.length === 0 && (
            <p className="text-center text-gray-500">
              You don't have any pending tool requests.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
