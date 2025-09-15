import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Nav() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              QiEOS
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors ${
                  isActive("/about")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                About
              </Link>
              <Link
                to="/services"
                className={`text-sm font-medium transition-colors ${
                  isActive("/services")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Services
              </Link>
              <Link
                to="/contact"
                className={`text-sm font-medium transition-colors ${
                  isActive("/contact")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.email}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
