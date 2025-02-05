import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { User } from "lucide-react";

const UserProfile = () => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast: toastNotification } = useToast();
  const navigate = useNavigate();

  const { data: profile, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          bio,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      toastNotification({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toastNotification({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        handleAvatarUpload(target.files[0]);
      }
    };
    input.click();
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a unique file name with user-specific folder
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update the avatar URL in the state
      setAvatarUrl(publicUrl);

      // If not in editing mode, save immediately
      if (!isEditing) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        toastNotification({
          title: "Success",
          description: "Profile picture updated successfully",
        });
        refetch();
      }
    } catch (error: any) {
      toastNotification({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-xl font-semibold">Profile</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div 
            className="relative group cursor-pointer"
            onClick={handleAvatarClick}
          >
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={avatarUrl}
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback>
                <User className="w-12 h-12 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-full flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 text-sm">
                {isUploading ? "Uploading..." : "Change"}
              </span>
            </div>
          </div>
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