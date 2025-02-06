
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditToolFormFields } from "@/components/tool-detail/EditToolFormFields";

type ToolCategory = Database["public"]["Enums"]["tool_category"];

export const AddToolForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<ToolCategory[]>(["Tools"]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      let imageUrl = null;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('tools')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('tools')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // First insert the tool
      const { data: tool, error: toolError } = await supabase
        .from('tools')
        .insert({
          name,
          description,
          image_url: imageUrl,
          owner_id: user.id,
          status: 'available'
        })
        .select()
        .single();

      if (toolError) throw toolError;

      // Then insert the categories
      const { error: categoriesError } = await supabase
        .from('tool_categories')
        .insert(
          categories.map(category => ({
            tool_id: tool.id,
            category
          }))
        );

      if (categoriesError) throw categoriesError;

      toast({
        title: "Success!",
        description: "Your tool has been added.",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EditToolFormFields
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        categories={categories}
        setCategories={setCategories}
        setImage={setImage}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Adding Item..." : "Add Item"}
      </Button>
    </form>
  );
};
