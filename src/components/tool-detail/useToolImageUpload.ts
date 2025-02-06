import { supabase } from "@/integrations/supabase/client";

export const useToolImageUpload = () => {
  const uploadImage = async (image: File | null, currentImageUrl: string | null) => {
    if (!image) return currentImageUrl;

    const fileExt = image.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage
      .from('tools')
      .upload(fileName, image);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('tools')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  return { uploadImage };
};