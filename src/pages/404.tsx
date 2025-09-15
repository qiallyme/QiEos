import React from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { Button } from "../components/ui/button";
import { GradientText } from "../components/ui/gradient-text";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Section>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-8">
              <h1 className="text-8xl md:text-9xl font-bold text-primary/20 mb-4">
                404
              </h1>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                The page you're looking for doesn't exist or has been moved.
                Let's get you back on track.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <a href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                Need help?{" "}
                <a href="/contact" className="text-primary hover:underline">
                  Contact us
                </a>
              </p>
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
