
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface ToolWithProfile extends Tables<"tools"> {
  profiles: {
    username: string | null;
    phone_number: string | null;
  } | null;
}

export const useToolDetail = (id: string) => {
  const { data: tool, isLoading: loadingTool } = useQuery({
    queryKey: ['tool', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select(`
          *,
          profiles:owner_id (
            username,
            phone_number
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as ToolWithProfile;
    },
  });

  return { tool, loadingTool };
};
