
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { BottomNav } from "@/components/BottomNav";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const UserProfile = () => {
  const {
    profile,
    username,
    setUsername,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    isEditing,
    setIsEditing,
    isUploading,
    setIsUploading,
    handleSave,
    handleLogout,
    refetch
  } = useProfile();

  const { data: lendingCount } = useQuery({
    queryKey: ['lending-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .rpc('get_user_lending_count', { user_id: user.id });

      if (error) throw error;
      return data || 0;
    },
  });

  const { data: borrowingCount } = useQuery({
    queryKey: ['borrowing-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .rpc('get_user_borrowing_count', { user_id: user.id });

      if (error) throw error;
      return data || 0;
    },
  });

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ProfileHeader 
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />

      <main className="container max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <ProfileAvatar 
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            refetch={refetch}
            isEditing={isEditing}
          />
          {isEditing ? (
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="max-w-xs"
            />
          ) : (
            <h2 className="text-xl font-medium">{username || "Anonymous"}</h2>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-600">{lendingCount}</div>
            <div className="text-sm text-gray-600">Times Lent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">{borrowingCount}</div>
            <div className="text-sm text-gray-600">Times Borrowed</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Bio</h3>
          {isEditing ? (
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-[100px]"
            />
          ) : (
            <p className="text-gray-600">{bio || "No bio yet"}</p>
          )}
        </div>

        {isEditing && (
          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        )}

        <Button 
          variant="destructive" 
          size="lg" 
          className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90 text-base font-semibold py-6"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </main>
      <BottomNav />
    </div>
  );
};

export default UserProfile;
