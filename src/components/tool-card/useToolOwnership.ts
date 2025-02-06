
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useToolOwnership = (owner: string) => {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, phone_number')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          const ownerUsername = owner.split('@')[0];
          setIsOwner(
            profile.username === owner || 
            profile.phone_number === owner
          );
        }
      }
    };
    
    checkOwnership();
  }, [owner]);

  return { isOwner };
};
