
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface RequestWithProfile extends Tables<"tool_requests"> {
  profiles: {
    username: string | null;
    phone_number: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

export const useToolRequests = (id: string) => {
  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['tool-requests', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tool_requests')
        .select(`
          *,
          profiles:requester_id (
            username,
            phone_number,
            email,
            avatar_url
          )
        `)
        .eq('tool_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RequestWithProfile[];
    },
  });

  return { requests, loadingRequests };
};
