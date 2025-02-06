
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Database } from "@/integrations/supabase/types";
import { CategorySelect } from "@/components/shared/CategorySelect";

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
          autoComplete="off"
          autoFocus={false}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <CategorySelect
          selectedCategory={category}
          onCategoryChange={setCategory}
        />
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
