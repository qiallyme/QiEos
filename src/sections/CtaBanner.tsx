import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { Button } from "../components/ui/button";
import { GradientText } from "../components/ui/gradient-text";

export default function CtaBanner() {
  return (
    <Section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
      <div className="absolute inset-0 bg-black/20" />

      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-white"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            Ready to{" "}
            <GradientText className="text-white">Transform</GradientText> Your
            Business?
          </h2>

          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can streamline your operations, reduce costs,
            and drive sustainable growth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <a
                href="https://crm.qially.com/bookings/qimoment"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book a Free Consultation
              </a>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              asChild
            >
              <a href="/contact">
                Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <p className="text-sm text-white/70 mt-6">
            No sales pressure, just a conversation about your business needs.
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}
