
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useToolDetail = (id: string) => {
  const { data: tool, isLoading: loadingTool } = useQuery({
    queryKey: ['tool', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select(`
          id,
          name,
          description,
          image_url,
          status,
          brand,
          model,
          condition,
          maintenance_notes,
          purchase_date,
          owner_id,
          profiles:owner_id (
            username,
            email
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep cache for 30 minutes
  });

  return { tool, loadingTool };
};

