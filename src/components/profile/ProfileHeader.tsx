import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";

interface ProfileHeaderProps {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

export const ProfileHeader = ({
  isEditing,
  setIsEditing,
}: ProfileHeaderProps) => {
  return (
    <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <h1 className="text-xl font-semibold">Profile</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
};