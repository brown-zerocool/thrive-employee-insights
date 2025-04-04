
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
          <Link to="/dashboard" className="text-gray-700 hover:text-thrive-600 transition-colors">
            Dashboard
          </Link>
          <Link to="/employees" className="text-gray-700 hover:text-thrive-600 transition-colors">
            Employees
          </Link>
          <Link to="/upload" className="text-gray-700 hover:text-thrive-600 transition-colors">
            Upload Data
          </Link>
          <Link to="/login">
            <Button variant="outline" className="mr-2">Login</Button>
          </Link>
          <Link to="/signup">
            <Button>Sign Up</Button>
          </Link>
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
            <div className="flex flex-col space-y-2 pt-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
