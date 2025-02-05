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
        .from('tool_requests')
        .select(`
          *,
          tool:tool_id (
            *,
            profiles:owner_id (
              username,
              email
            ),
            tool_requests (
              status,
              id
            )
          )
        `)
        .eq('requester_id', user.id)
        .eq('status', 'approved');

      if (error) throw error;
      return data.map(checkout => ({
        ...checkout,
        tool: {
          ...checkout.tool,
          status: checkout.tool.tool_requests?.some(request => request.status === 'pending')
            ? 'requested' as const
            : checkout.tool.tool_requests?.some(request => request.status === 'approved')
              ? 'checked_out' as const
              : 'available' as const
        }
      }));
    },
  });

  const { data: pendingTools, isLoading: loadingPending } = useQuery({
    queryKey: ['pending-tool-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('tool_requests')
        .select(`
          *,
          tool:tool_id (
            *,
            profiles:owner_id (
              username,
              email
            ),
            tool_requests (
              status,
              id
            )
          )
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      return data.map(request => ({
        ...request,
        tool: {
          ...request.tool,
          status: request.tool.tool_requests?.some(req => req.status === 'pending')
            ? 'requested' as const
            : request.tool.tool_requests?.some(req => req.status === 'approved')
              ? 'checked_out' as const
              : 'available' as const
        }
      }));
    },
  });

  if (loadingCheckedOut || loadingPending) {
    return <div className="text-center text-gray-500">Loading tools...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Borrowed Tools</h2>
        <div className="grid gap-4">
          {checkedOutTools?.map((checkout) => (
            <ToolCard
              key={checkout.tool.id}
              id={checkout.tool.id}
              name={checkout.tool.name}
              description={checkout.tool.description}
              imageUrl={checkout.tool.image_url || "/placeholder.svg"}
              owner={
                checkout.tool.profiles?.username || 
                checkout.tool.profiles?.email?.split('@')[0] || 
                'Anonymous'
              }
              status={checkout.tool.status}
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
          {pendingTools?.map((request) => (
            <ToolCard
              key={request.tool.id}
              id={request.tool.id}
              name={request.tool.name}
              description={request.tool.description}
              imageUrl={request.tool.image_url || "/placeholder.svg"}
              owner={
                request.tool.profiles?.username || 
                request.tool.profiles?.email?.split('@')[0] || 
                'Anonymous'
              }
              status={request.tool.status}
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