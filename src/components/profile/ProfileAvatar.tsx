import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProfileAvatarProps {
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  refetch: () => void;
  isEditing: boolean;
}

export const ProfileAvatar = ({
  avatarUrl,
  setAvatarUrl,
  isUploading,
  setIsUploading,
  refetch,
  isEditing
}: ProfileAvatarProps) => {
  const { toast } = useToast();

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

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      if (!isEditing) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
        refetch();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
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
  );
};