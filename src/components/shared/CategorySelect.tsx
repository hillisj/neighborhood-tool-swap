
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
  'Other'
];

interface CategorySelectProps {
  selectedCategory: ToolCategory;
  onCategoryChange: (category: ToolCategory) => void;
}

export const CategorySelect = ({
  selectedCategory,
  onCategoryChange,
}: CategorySelectProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <Badge
          key={category}
          variant="secondary"
          className={cn(
            "cursor-pointer",
            selectedCategory === category ? "bg-accent hover:bg-accent/80" : ""
          )}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
};
