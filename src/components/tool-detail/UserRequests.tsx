import { ToolRequest } from "@/components/ToolRequest";
import { Tables } from "@/integrations/supabase/types";
import { useToolActions } from "@/hooks/useToolActions";

interface UserRequestsProps {
  requests: (Tables<"tool_requests"> & {
    profiles: {
      username: string | null;
      email: string | null;
      avatar_url: string | null;
    } | null;
  })[];
  toolName: string;
}

export const UserRequests = ({ requests, toolName }: UserRequestsProps) => {
  const { handleCancelRequest } = useToolActions(requests[0]?.tool_id || '');

  return (
    <div className="p-6 border-t">
      <h2 className="text-lg font-semibold mb-4">Your Requests</h2>
      <div className="space-y-4">
        {requests.map((request) => (
          <ToolRequest
            key={request.id}
            toolName={toolName}
            requesterName={request.profiles?.username || request.profiles?.email?.split('@')[0] || 'Anonymous'}
            status={request.status}
            dueDate={request.due_date}
            avatarUrl={request.profiles?.avatar_url}
            createdAt={request.created_at}
            updatedAt={request.updated_at}
            returnDate={request.return_date}
            showActions={true}
            showRequester={false}
            onCancel={() => handleCancelRequest(request.id)}
          />
        ))}
      </div>
    </div>
  );
};