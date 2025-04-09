
import { Button } from "@/components/ui/button";
import UserProfileModal from "@/components/UserProfileModal";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import NotificationsSystem from "./NotificationsSystem";
import { Settings, Users, Home, Brain } from "lucide-react";

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Function to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-background border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">RetainAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-1 ${
                    isActive("/dashboard") || isActive("/") 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground transition-colors"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/employees" 
                  className={`flex items-center gap-1 ${
                    isActive("/employees") 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground transition-colors"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Employees</span>
                </Link>
                <Link 
                  to="/ml-dashboard" 
                  className={`flex items-center gap-1 ${
                    isActive("/ml-dashboard") 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground transition-colors"
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  <span>ML Dashboard</span>
                </Link>
                <Link 
                  to="/settings" 
                  className={`flex items-center gap-1 ${
                    isActive("/settings") 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground transition-colors"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NotificationsSystem />
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </Link>
              <UserProfileModal />
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
