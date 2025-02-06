import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface LibraryHeaderProps {
  isAuthenticated: boolean | null;
  userProfile: {
    username?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
}

export const LibraryHeader = ({ isAuthenticated, userProfile }: LibraryHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <h1 className="text-xl font-semibold">Lending Library</h1>
        {isAuthenticated ? (
          <Link to="/user-profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <span className="text-sm">
              {userProfile?.username || userProfile?.email?.split('@')[0] || 'Profile'}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={userProfile?.avatar_url || ''}
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback>
                <User className="h-4 w-4 text-gray-400" />
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};