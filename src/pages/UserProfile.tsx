import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { BottomNav } from "@/components/BottomNav";
import { useEffect } from "react";

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
        handleLogout={handleLogout}
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
      </main>
      <BottomNav />
    </div>
  );
};

export default UserProfile;