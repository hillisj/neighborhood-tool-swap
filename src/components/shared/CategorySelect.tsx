
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";

type ToolCategory = Database["public"]["Enums"]["tool_category"];

const CATEGORIES: ToolCategory[] = [
  'Kids',
  'Music',
  'Electronics',
  'Exercise',
  'Emergency',
  'Household',
  'Gardening',
  'Tools',
  'Kitchen',
  'Games',
  'Outdoors',
  'Other'
];

interface CategorySelectProps {
  selectedCategories: ToolCategory[];
  onCategoryChange: (categories: ToolCategory[]) => void;
}

export const CategorySelect = ({
  selectedCategories,
  onCategoryChange,
}: CategorySelectProps) => {
  const toggleCategory = (category: ToolCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <Badge
          key={category}
          variant="secondary"
          className={cn(
            "cursor-pointer",
            selectedCategories.includes(category) ? "bg-accent hover:bg-accent/80" : ""
          )}
          onClick={() => toggleCategory(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
};
