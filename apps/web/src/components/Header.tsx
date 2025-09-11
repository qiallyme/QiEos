import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { Sun, Moon } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();

  const navLinks = [
    { to: "/", text: "Home" },
    { to: "/about", text: "About" },
    { to: "/services", text: "Services" },
    { to: "/contact", text: "Contact" },
  ];

  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-md z-50 shadow-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            QiAlly
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-lg hover:text-primary ${
                    isActive ? "text-primary font-semibold" : ""
                  }`
                }
              >
                {link.text}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent"
              aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
              } mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            <div className="md:hidden ml-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open menu"
                title="Open menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden px-4 pt-2 pb-4 space-y-2 border-t border-border/50">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block text-lg py-2 px-4 rounded-md hover:bg-accent ${
                  isActive ? "bg-accent font-semibold text-primary" : ""
                }`
              }
            >
              {link.text}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export { Header };
