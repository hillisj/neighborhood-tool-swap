
import { ToolRequest } from "@/components/ToolRequest";
import { Tables } from "@/integrations/supabase/types";

interface OwnerRequestsProps {
  requests: (Tables<"tool_requests"> & {
    profiles: {
      username: string | null;
      email: string | null;
      avatar_url: string | null;
    } | null;
  })[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onMarkReturned: (id: string) => void;
  toolName: string;
}

export const OwnerRequests = ({ 
  requests, 
  onApprove, 
  onReject,
  toolName 
}: OwnerRequestsProps) => {
  return (
    <div className="p-6 border-t">
      <h2 className="text-lg font-semibold mb-4">Lend Your Item</h2>
      <div className="space-y-4">
        {requests.map((request) => (
          <ToolRequest
            key={request.id}
            toolName={toolName}
            requesterName={request.profiles?.username || request.profiles?.email?.split('@')[0] || 'Anonymous'}
            status={request.status}
            dueDate={request.due_date}
            avatarUrl={request.profiles?.avatar_url}
            onApprove={() => onApprove(request.id)}
            onReject={() => onReject(request.id)}
            updatedAt={request.updated_at}
            createdAt={request.created_at}
            returnDate={request.return_date}
          />
        ))}
      </div>
    </div>
  );
};

