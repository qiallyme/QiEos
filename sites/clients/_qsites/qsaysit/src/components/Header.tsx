import React from "react";

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-6 py-4">
        <h1 className="text-3xl font-bold">QSaysIt</h1>
        <p className="text-gray-600">A Podcast & Blog by Cody Rice Velasquez</p>
      </div>
    </header>
  );
};

export default Header;
