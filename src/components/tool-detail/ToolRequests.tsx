import { Tables } from "@/integrations/supabase/types";
import { RequestStatus } from "../RequestStatus";

interface ToolRequestsProps {
  requests: (Tables<"item_requests"> & {
    profiles: {
      username: string | null;
      email: string | null;
      avatar_url: string | null;
    } | null;
  })[];
  toolId: string;
}

export const ToolRequests = ({ requests, toolId }: ToolRequestsProps) => {
  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Requests</h2>
      <div className="space-y-4">
        {requests.map((request) => (
          <RequestStatus
            key={request.id}
            status={request.status || "pending"}
          />
        ))}
      </div>
    </div>
  );
};