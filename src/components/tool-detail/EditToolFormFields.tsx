import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Database } from "@/integrations/supabase/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ToolCategory = Database["public"]["Enums"]["tool_category"];

interface EditToolFormFieldsProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  category: ToolCategory;
  setCategory: (category: ToolCategory) => void;
  setImage: (file: File | null) => void;
}

export const EditToolFormFields = ({
  name,
  setName,
  description,
  setDescription,
  category,
  setCategory,
  setImage,
}: EditToolFormFieldsProps) => {
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

  return (
    <>
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
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImage(e.target.files[0]);
            }
          }}
          className="cursor-pointer"
        />
      </div>
    </>
  );
};