import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Database } from "@/integrations/supabase/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ToolCategory = Database["public"]["Enums"]["tool_category"];

export default function AddTool() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ToolCategory>("Tools");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories: ToolCategory[] = [
    'Kids',
    'Music',
    'Electronics',
    'Exercise',
    'Emergency',
    'Household',
    'Gardening',
    'Tools',
    'Kitchen',
    'Other'
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

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

      const { error } = await supabase.from('tools').insert({
        name,
        description,
        image_url: imageUrl,
        owner_id: user.id,
        category,
        status: 'available'
      });

      if (error) throw error;

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
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-center">Add New Tool</h1>
        </header>

        <main className="container max-w-md mx-auto px-4 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Tool Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                placeholder="e.g., Power Drill"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <ToggleGroup
                type="single"
                value={category}
                onValueChange={(value: ToolCategory) => {
                  if (value) setCategory(value);
                }}
                className="flex flex-wrap gap-2"
              >
                {categories.map((cat) => (
                  <ToggleGroupItem
                    key={cat}
                    value={cat}
                    className="rounded-full px-4 py-2 text-sm"
                  >
                    {cat}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe your tool..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">
                Tool Image
              </label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Adding Tool..." : "Add Tool"}
            </Button>
          </form>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}