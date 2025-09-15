import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { GradientText } from "../components/ui/gradient-text";

export default function Hero() {
  return (
    <Section className="relative overflow-hidden">
      {/* Animated gradient orb background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/30 to-fuchsia-500/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Container>
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-semibold tracking-tight mb-6"
          >
            Empower. Innovate. Grow.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto"
          >
            I help entrepreneurs simplify the chaos — tax, HR, tech, automation
            for small business life. <GradientText>Build it clean. Ship it fast. Own your ops.</GradientText>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild>
              <a href="https://crm.qially.com/bookings/qimoment" target="_blank" rel="noopener noreferrer">
                Book a Consult <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <a href="/services" className="text-sm font-medium underline-offset-4 hover:underline text-muted-foreground">
              See services
            </a>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
