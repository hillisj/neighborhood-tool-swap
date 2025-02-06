import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";
import { EditToolFormFields } from "./EditToolFormFields";
import { useToolImageUpload } from "./useToolImageUpload";

type ToolCategory = Database["public"]["Enums"]["tool_category"];

interface EditToolDialogProps {
  tool: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    category: ToolCategory;
  };
}

export const EditToolDialog = ({ tool }: EditToolDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(tool.name);
  const [description, setDescription] = useState(tool.description || "");
  const [category, setCategory] = useState<ToolCategory>(tool.category);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadImage } = useToolImageUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = await uploadImage(image, tool.image_url);

      const { error } = await supabase
        .from('tools')
        .update({
          name,
          description,
          category,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tool.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Tool details updated successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ['tool', tool.id] });
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tool</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <EditToolFormFields
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            category={category}
            setCategory={setCategory}
            setImage={setImage}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};