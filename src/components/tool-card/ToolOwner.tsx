import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ToolOwnerProps {
  owner: string;
}

export const ToolOwner = ({ owner }: ToolOwnerProps) => {
  const [ownerAvatar, setOwnerAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwnerAvatar = async () => {
      const ownerUsername = owner.split('@')[0];
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .or(`username.eq.${ownerUsername},email.ilike.${ownerUsername}@%`)
        .single();

      if (profile) {
        setOwnerAvatar(profile.avatar_url);
      }
    };

    fetchOwnerAvatar();
  }, [owner]);

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage
          src={ownerAvatar || ''}
          alt={owner}
          className="object-cover"
        />
        <AvatarFallback>
          <User className="h-3 w-3 text-gray-400" />
        </AvatarFallback>
      </Avatar>
      <p className="text-sm text-gray-500">Owner: {owner}</p>
    </div>
  );
};