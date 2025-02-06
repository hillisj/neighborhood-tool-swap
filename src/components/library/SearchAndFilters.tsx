import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ToolCategory = 'Kids' | 'Music' | 'Electronics' | 'Exercise' | 'Emergency' | 'Household' | 'Gardening' | 'Tools' | 'Kitchen' | 'Other';

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
  'Other'
];

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ToolCategory | null;
  setSelectedCategory: (category: ToolCategory | null) => void;
}

export const SearchAndFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: SearchAndFiltersProps) => {
  return (
    <div className="mb-6">
      <Input
        type="search"
        placeholder="Search tools..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4"
      />
      <div className="flex flex-wrap gap-2">
        <Badge
          variant="secondary"
          className={cn(
            "cursor-pointer",
            selectedCategory === null ? "bg-accent hover:bg-accent/80" : ""
          )}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Badge>
        {CATEGORIES.map((category) => (
          <Badge
            key={category}
            variant="secondary"
            className={cn(
              "cursor-pointer",
              selectedCategory === category ? "bg-accent hover:bg-accent/80" : ""
            )}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
};