import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useToolRequests = (id: string) => {
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
  });

  return { requests, loadingRequests };
};