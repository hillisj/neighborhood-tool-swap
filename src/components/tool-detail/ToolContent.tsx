import { Tables } from "@/integrations/supabase/types";
import { ToolImage } from "./ToolImage";
import { ToolDetailInfo } from "./ToolDetailInfo";
import { ToolRequests } from "./ToolRequests";
import { CurrentCheckout } from "./CurrentCheckout";
import { DangerZone } from "./DangerZone";
import { RequestToolButton } from "./RequestToolButton";
import { useAuth } from "@/hooks/useAuth";

interface ToolContentProps {
  tool: Tables<"items"> & {
    profiles: {
      username: string | null;
      email: string | null;
    } | null;
  };
  requests: (Tables<"item_requests"> & {
    profiles: {
      username: string | null;
      email: string | null;
      avatar_url: string | null;
    } | null;
  })[];
  activeCheckout: Tables<"item_requests"> & {
    profiles: {
      username: string | null;
      email: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
  isLoading: boolean;
  isOwner: boolean;
  requiresAuth?: boolean;
}

export const ToolContent = ({
  tool,
  requests,
  activeCheckout,
  isLoading,
  isOwner,
  requiresAuth,
}: ToolContentProps) => {
  const { user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const pendingRequests = requests.filter(
    (request) =>
      request.requester_id === user?.id && request.status === "pending"
  );

  const canRequest =
    !isOwner &&
    tool.status === "available" &&
    pendingRequests.length === 0;

  return (
    <div className="space-y-8">
      <ToolImage
        imageUrl={tool.image_url || "/placeholder.svg"}
        name={tool.name}
      />

      <div className="space-y-6">
        {!isOwner && canRequest && (
          <RequestToolButton toolId={tool.id} requiresAuth={requiresAuth} />
        )}

        {tool.status !== "available" && activeCheckout && (
          <CurrentCheckout
            checkout={activeCheckout}
            onMarkReturned={() => {}}
          />
        )}

        <ToolDetailInfo
          tool={tool}
          isOwner={isOwner}
        />

        {isOwner && (
          <>
            <ToolRequests
              requests={requests}
              toolId={tool.id}
            />
            <DangerZone toolId={tool.id} onDelete={() => {}} />
          </>
        )}
      </div>
    </div>
  );
};