
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ToolRequest } from "@/components/ToolRequest";
import { toast } from "sonner";

export const PendingRequests = () => {
  const { data: toolRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ['tool-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('tool_requests')
        .select(`
          *,
          tool:tool_id (
            name,
            owner_id
          ),
          requester:requester_id (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleRequestAction = async (requestId: string, status: 'approved' | 'rejected' | 'returned', dueDate?: string) => {
    try {
      const { error } = await supabase
        .from('tool_requests')
        .update({ 
          status,
          ...(status === 'approved' ? { due_date: dueDate } : {}),
          ...(status === 'returned' ? { return_date: new Date().toISOString() } : {})
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Request ${status} successfully`);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  if (loadingRequests) {
    return <div className="text-center text-gray-500">Loading requests...</div>;
  }

  const pendingRequests = toolRequests?.filter(request => 
    request.tool?.owner_id === (supabase.auth.getUser() as any).data?.user?.id &&
    request.status === 'pending'
  );

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-lg font-medium">Pending Requests</h2>
      <div className="grid gap-4">
        {pendingRequests?.map((request) => (
          <ToolRequest
            key={request.id}
            toolName={request.tool?.name || 'Unknown Tool'}
            requesterName={
              request.requester?.username || 
              request.requester?.email?.split('@')[0] || 
              'Anonymous'
            }
            status={request.status}
            onApprove={() => {
              const dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + 7);
              handleRequestAction(request.id, 'approved', dueDate.toISOString());
            }}
            onReject={() => handleRequestAction(request.id, 'rejected')}
          />
        ))}
        {pendingRequests?.length === 0 && (
          <p className="text-center text-gray-500">
            No pending requests.
          </p>
        )}
      </div>
    </div>
  );
};
