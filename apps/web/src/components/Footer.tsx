import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background/80 backdrop-blur-md print:hidden mt-16 border-t border-border/50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
          <div>
            <h3 className="text-xl font-bold">QiAlly</h3>
            <p className="text-muted-foreground max-w-sm">
              Your ally in business, providing expert services in tax, HR, tech,
              and automation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8">
            <div className="flex space-x-8">
              <Link
                to="/terms"
                className="text-muted-foreground hover:text-primary"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="text-muted-foreground hover:text-primary"
              >
                Privacy
              </Link>
            </div>
            <div className="text-muted-foreground">
              © {new Date().getFullYear()} QiAlly
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
