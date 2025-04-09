import { Button } from "@/components/ui/button";
import { UserProfileModal } from "@/components/UserProfileModal";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

// Import the NotificationsSystem component
import NotificationsSystem from "./NotificationsSystem";
import { Settings } from "lucide-react";

export const Navbar = () => {
  const { isLoggedIn } = useAuth();

  return (
    <header className="bg-background border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">RetainAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {isLoggedIn && (
              <>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/employees" className="text-muted-foreground hover:text-foreground transition-colors">
                  Employees
                </Link>
                <Link to="/ml-dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  ML Dashboard
                </Link>
                <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
                  Settings
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
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
