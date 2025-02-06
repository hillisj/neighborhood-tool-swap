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

const ToolDetail = () => {
  const { id } = useParams();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: tool, isLoading: loadingTool } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles:owner_id (
            username,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['item-requests', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_requests')
        .select(`
          *,
          profiles:requester_id (
            username,
            email,
            avatar_url
          )
        `)
        .eq('item_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: activeCheckout } = useQuery({
    queryKey: ['active-checkout', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_requests')
        .select(`
          *,
          profiles:requester_id (
            username,
            email,
            avatar_url
          )
        `)
        .eq('item_id', id)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id && tool?.status === 'checked_out',
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Item not found</h1>
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
          tool={tool}
          requests={requests}
          activeCheckout={activeCheckout}
          isOwner={isOwner}
          isLoading={loadingRequests}
          requiresAuth={!currentUser}
        />
      </div>
      <BottomNav />
    </div>
  );
};

export default ToolDetail;