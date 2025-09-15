import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background print:bg-white relative">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-background dark:from-primary/5 dark:via-secondary/5 -z-10" />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export { MarketingLayout };
