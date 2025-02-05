
import { Grid, Plus, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
        <Link
          to="/add"
          className={`flex flex-col items-center space-y-1 ${
            isActive("/add") ? "text-accent" : "text-gray-600"
          }`}
        >
          <Plus size={24} />
          <span className="text-xs">Add Tool</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center space-y-1 ${
            isActive("/profile") ? "text-accent" : "text-gray-600"
          }`}
        >
          <User size={24} />
          <span className="text-xs">Your Tools</span>
        </Link>
      </nav>
    </div>
  );
};
