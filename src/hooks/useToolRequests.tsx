
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useToolRequests = (id: string) => {
  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['tool-requests', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tool_requests')
        .select(`
          id,
          status,
          created_at,
          due_date,
          return_date,
          requester_id,
          profiles:requester_id (
            username,
            email,
            avatar_url
          )
        `)
        .eq('tool_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep cache for 30 minutes
  });

  return { requests, loadingRequests };
};
