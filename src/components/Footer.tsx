import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Youtube, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background/80 backdrop-blur-md print:hidden mt-16 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://res.cloudinary.com/dp5b5fymz/image/upload/v1755927329/qibird.svg"
                alt="QiAlly Logo"
                className="w-6 h-6"
              />
              <h3 className="text-xl font-bold">QiAlly</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Your ally in business, providing expert services in tax, HR, tech,
              and automation. Empowering entrepreneurs to simplify the chaos.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/qially1/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/QiAlly"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@qiallyme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link
                to="/about"
                className="block text-muted-foreground hover:text-primary"
              >
                About
              </Link>
              <Link
                to="/services"
                className="block text-muted-foreground hover:text-primary"
              >
                Services
              </Link>
              <Link
                to="/contact"
                className="block text-muted-foreground hover:text-primary"
              >
                Contact
              </Link>
              <Link
                to="/terms"
                className="block text-muted-foreground hover:text-primary"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="block text-muted-foreground hover:text-primary"
              >
                Privacy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Info@qially.me</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (765) 443-4769</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} QiAlly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
