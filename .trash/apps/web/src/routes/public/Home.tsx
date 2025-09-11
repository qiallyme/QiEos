import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FiArrowRight, FiLogIn, FiGrid } from "react-icons/fi";

export function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-electric-blue to-plasma-purple text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-4">
              <img
                className="h-10 w-10"
                src="/iconhbtrans.ico"
                alt="Qially Logo"
              />
              <span className="text-3xl font-bold tracking-wider">Qially</span>
            </div>
            <div className="flex items-center space-x-6">
              {user ? (
                <Link
                  to="/client"
                  className="flex items-center space-x-2 bg-plasma-purple/80 text-white px-6 py-3 rounded-lg hover:bg-plasma-purple transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <FiGrid />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/auth/login"
                  className="flex items-center space-x-2 bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                >
                  <FiLogIn />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-20">
        <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-4">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

          <div className="relative z-10 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-xl p-12 rounded-2xl shadow-2xl border border-white/20">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
                  QiEOS
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
                The unified platform for modern business. Brought to you by
                Qially.
              </p>
              <div className="flex justify-center space-x-6">
                <Link
                  to={user ? "/client" : "/auth/login"}
                  className="group flex items-center space-x-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-8 py-4 rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <span>{user ? "Go to Dashboard" : "Get Started"}</span>
                  <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/kb"
                  className="bg-white/20 text-white px-8 py-4 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
