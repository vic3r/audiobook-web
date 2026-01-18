import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Home, Search, Library } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
              <BookOpen className="w-6 h-6" />
              <span>Audible</span>
            </Link>
            <div className="flex space-x-4">
              <Link to="/" className="flex items-center space-x-1 hover:text-orange-200">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link to="/browse" className="flex items-center space-x-1 hover:text-orange-200">
                <Search className="w-4 h-4" />
                <span>Browse</span>
              </Link>
              {isAuthenticated && (
                <Link to="/library" className="flex items-center space-x-1 hover:text-orange-200">
                  <Library className="w-4 h-4" />
                  <span>My Library</span>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm">Hello, {user?.firstName}</span>
                <button
                  onClick={handleLogout}
                  className="bg-orange-700 hover:bg-orange-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-orange-700 hover:bg-orange-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-orange-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
