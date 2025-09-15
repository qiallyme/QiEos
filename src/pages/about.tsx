import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Award, Users, TrendingUp } from "lucide-react";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { GlassCard } from "../components/ui/glass-card";
import { Button } from "../components/ui/button";
import { GradientText } from "../components/ui/gradient-text";

const values = [
  "Clear, direct communication",
  "ADHD-friendly, async-ready approach",
  "No jargon, no run-around",
  "Proactive problem solving",
  "Measurable results",
];

const stats = [
  { number: "200+", label: "Systems Optimized" },
  { number: "$3M+", label: "Savings Delivered" },
  { number: "80+", label: "Solutions Implemented" },
  { number: "20+", label: "Years Experience" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-3xl" />
        </div>

        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
                Hi, I'm <GradientText>Cody</GradientText> – your ally in all
                things business.
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                With over 20 years of experience juggling everything from
                Fortune 500 tech to Main Street startups, I provide solo
                operator, personal service to get you real results.
              </p>

              <div className="space-y-4">
                {values.map((value, index) => (
                  <motion.div
                    key={value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <GlassCard className="p-8">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">C</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Cody</h3>
                  <p className="text-muted-foreground mb-4">
                    Business Operations Specialist
                  </p>
                  <div className="flex justify-center space-x-4">
                    <div className="text-center">
                      <Award className="h-6 w-6 text-primary mx-auto mb-1" />
                      <span className="text-sm text-muted-foreground">
                        Certified
                      </span>
                    </div>
                    <div className="text-center">
                      <Users className="h-6 w-6 text-primary mx-auto mb-1" />
                      <span className="text-sm text-muted-foreground">
                        Expert
                      </span>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 text-primary mx-auto mb-1" />
                      <span className="text-sm text-muted-foreground">
                        Results
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section className="bg-muted/30">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              My Outstanding Achievements
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore my track record of driving savings and growth
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Let's Work Together
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ready to transform your business operations? Let's discuss how I
              can help you achieve your goals.
            </p>
            <Button size="lg" asChild>
              <a
                href="https://crm.qially.com/bookings/qimoment"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a Consultation
              </a>
            </Button>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
