
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ToolDetailHeader } from "@/components/tool-detail/ToolDetailHeader";
import { ToolDetailSkeleton } from "@/components/tool-detail/ToolDetailSkeleton";
import { BottomNav } from "@/components/BottomNav";
import { useToolDetail } from "@/hooks/useToolDetail";
import { useToolRequests } from "@/hooks/useToolRequests";
import { useActiveCheckout } from "@/hooks/useActiveCheckout";
import { ToolContent } from "@/components/tool-detail/ToolContent";
import { Database } from "@/integrations/supabase/types";

type ToolCategory = Database["public"]["Enums"]["tool_category"];

export interface ProfileData {
  username: string | null;
  phone_number: string | null;
  avatar_url?: string | null;
}

interface ToolWithProfile extends Tables<"tools"> {
  profiles: {
    username: string | null;
    phone_number: string | null;
  } | null;
}

interface RequestWithProfile extends Tables<"tool_requests"> {
  profiles: {
    username: string | null;
    phone_number: string | null;
    avatar_url: string | null;
  } | null;
}

const ToolDetail = () => {
  const { id } = useParams();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { tool, loadingTool } = useToolDetail(id!);
  const { requests } = useToolRequests(id!);
  const { activeCheckout } = useActiveCheckout(id!, tool?.status || '');

  const hasPendingRequests = requests.some(request => request.status === 'pending');
  const isOwner = currentUser?.id === tool?.owner_id;

  if (loadingTool) {
    return (
      <>
        <ToolDetailSkeleton />
        <BottomNav />
      </>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">Tool not found</h1>
          <button onClick={() => window.history.back()}>Go back</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <ToolDetailHeader />
        <ToolContent
          tool={tool as ToolWithProfile}
          requests={requests as RequestWithProfile[]}
          activeCheckout={activeCheckout as RequestWithProfile}
          isOwner={isOwner}
          hasPendingRequests={hasPendingRequests}
          requiresAuth={!currentUser}
        />
      </div>
      <BottomNav />
    </div>
  );
};

export default ToolDetail;
