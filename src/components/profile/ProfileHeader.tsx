import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  handleLogout: () => void;
}

export const ProfileHeader = ({
  isEditing,
  setIsEditing,
  handleLogout
}: ProfileHeaderProps) => {
  return (
    <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <h1 className="text-xl font-semibold">Profile</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
};