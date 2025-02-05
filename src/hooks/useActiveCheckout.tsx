import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useActiveCheckout = (id: string, toolStatus: string) => {
  const { data: activeCheckout } = useQuery({
    queryKey: ['active-checkout', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tool_requests')
        .select(`
          *,
          profiles:requester_id (
            username,
            email,
            avatar_url
          )
        `)
        .eq('tool_id', id)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id && toolStatus === 'checked_out',
  });

  return { activeCheckout };
};