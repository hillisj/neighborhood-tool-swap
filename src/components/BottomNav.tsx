
import { Grid, Plus, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface BottomNavProps {
  authRequired?: boolean;
}

export const BottomNav = ({ authRequired }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isActive = (path: string) => location.pathname === path;

  const handleProtectedNavigation = (path: string) => {
    if (authRequired) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature.",
        variant: "default",
      });
      navigate('/auth');
      return;
    }
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <nav className="flex justify-around items-center h-16 px-4 max-w-md mx-auto">
        <Link
          to="/"
          className={`flex flex-col items-center space-y-1 ${
            isActive("/") ? "text-accent" : "text-gray-600"
          }`}
        >
          <Grid size={24} />
          <span className="text-xs">Tools</span>
        </Link>
        <button
          onClick={() => handleProtectedNavigation('/add')}
          className={`flex flex-col items-center space-y-1 ${
            isActive("/add") ? "text-accent" : "text-gray-600"
          }`}
        >
          <Plus size={24} />
          <span className="text-xs">Add Tool</span>
        </button>
        <button
          onClick={() => handleProtectedNavigation('/profile')}
          className={`flex flex-col items-center space-y-1 ${
            isActive("/profile") ? "text-accent" : "text-gray-600"
          }`}
        >
          <User size={24} />
          <span className="text-xs">Your Tools</span>
        </button>
      </nav>
    </div>
  );
};
