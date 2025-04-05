
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, UserIcon, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const handleLogin = () => {
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleSignup = () => {
    navigate("/signup");
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    setIsMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className="py-4 px-6 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-thrive-600"
          >
            <path d="M16 16h6"></path>
            <path d="M21 10V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7"></path>
            <path d="M12 4v4"></path>
            <path d="M9 4v1"></path>
            <path d="M15 4v1"></path>
            <path d="M16 19h6"></path>
            <path d="M19 16v6"></path>
          </svg>
          <span className="text-xl font-semibold text-gray-900">Thrive</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-thrive-600 transition-colors">
                Dashboard
              </Link>
              <Link to="/employees" className="text-gray-700 hover:text-thrive-600 transition-colors">
                Employees
              </Link>
              <Link to="/upload" className="text-gray-700 hover:text-thrive-600 transition-colors">
                Upload Data
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-thrive-600 text-white flex items-center justify-center">
                      {getUserInitials()}
                    </div>
                    <span className="hidden md:inline-block">
                      {user?.email || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="h-10 w-10 rounded-full bg-thrive-600 text-white flex items-center justify-center text-lg">
                      {getUserInitials()}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user?.email}</p>
                      <p className="text-xs text-muted-foreground">{user?.role || 'User'}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="mr-2">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-gray-700">
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md z-50 animate-fade-in">
          <div className="flex flex-col py-4 px-6 space-y-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 py-2 border-b pb-4">
                  <div className="h-10 w-10 rounded-full bg-thrive-600 text-white flex items-center justify-center">
                    {getUserInitials()}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">{user?.role || 'User'}</p>
                  </div>
                </div>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-thrive-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/employees" 
                  className="text-gray-700 hover:text-thrive-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Employees
                </Link>
                <Link 
                  to="/upload" 
                  className="text-gray-700 hover:text-thrive-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Upload Data
                </Link>
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-thrive-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="text-gray-700 hover:text-thrive-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 w-full mt-2" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="outline" className="w-full" onClick={handleLogin}>
                  Login
                </Button>
                <Button className="w-full" onClick={handleSignup}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
