import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Calculator,
  Users,
  Zap,
  Settings,
  Check,
  ArrowRight,
} from "lucide-react";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { GlassCard } from "../components/ui/glass-card";
import { Button } from "../components/ui/button";
import { GradientText } from "../components/ui/gradient-text";

const services = [
  {
    icon: Calculator,
    title: "Taxes & Bookkeeping",
    description:
      "Comprehensive financial management to keep your business compliant and profitable.",
    features: [
      "Tax preparation and filing",
      "Monthly bookkeeping services",
      "Financial statement preparation",
      "Tax planning and strategy",
      "Audit support and representation",
      "Payroll processing",
    ],
    pricing: "Starting at $200/month",
  },
  {
    icon: Users,
    title: "HR & Compliance",
    description:
      "Navigate complex HR requirements with confidence and stay compliant.",
    features: [
      "Employee handbook development",
      "Policy creation and updates",
      "Compliance audits and training",
      "Employee relations support",
      "Benefits administration",
      "Workplace safety programs",
    ],
    pricing: "Starting at $150/month",
  },
  {
    icon: Zap,
    title: "Automation & Tools",
    description:
      "Streamline operations with smart automation and the right technology stack.",
    features: [
      "Process automation setup",
      "Tool integration and training",
      "Workflow optimization",
      "Data migration services",
      "Custom solution development",
      "Ongoing support and maintenance",
    ],
    pricing: "Starting at $300/month",
  },
  {
    icon: Settings,
    title: "IT & Strategy",
    description:
      "Strategic IT planning and implementation for sustainable growth.",
    features: [
      "IT strategy and planning",
      "System setup and configuration",
      "Security assessments",
      "Cloud migration services",
      "Technical support",
      "Vendor management",
    ],
    pricing: "Starting at $250/month",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$500",
    period: "/month",
    description: "Perfect for small businesses getting started",
    features: [
      "Basic bookkeeping",
      "Tax preparation",
      "Monthly check-ins",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Grow",
    price: "$1,200",
    period: "/month",
    description: "Comprehensive support for growing businesses",
    features: [
      "Full bookkeeping & tax services",
      "HR compliance support",
      "Process automation",
      "Weekly check-ins",
      "Priority support",
      "Custom reporting",
    ],
    popular: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    description: "Tailored solutions for established businesses",
    features: [
      "All Grow features",
      "Dedicated account manager",
      "Custom automation",
      "Strategic planning",
      "24/7 support",
      "Custom integrations",
    ],
    popular: false,
  },
];

export default function ServicesPage() {
  const [expandedService, setExpandedService] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-3xl" />
        </div>

        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
              Comprehensive <GradientText>Business Services</GradientText>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From tax preparation to IT strategy, I provide end-to-end
              solutions that simplify your operations and drive sustainable
              growth.
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Services Section */}
      <Section>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              What I Can Help You With
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Detailed breakdown of services and what's included in each
              package.
            </p>
          </motion.div>

          <div className="space-y-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedService(
                        expandedService === index ? null : index
                      )
                    }
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {service.description}
                        </p>
                        <p className="text-sm text-primary font-medium mt-1">
                          {service.pricing}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        expandedService === index ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {expandedService === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 pt-6 border-t"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center space-x-2"
                          >
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Pricing Section */}
      <Section className="bg-muted/30">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business needs. All plans include
              ongoing support and consultation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <GlassCard
                  className={`p-8 h-full flex flex-col ${
                    plan.popular ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full text-center mb-4">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold mb-1">
                      {plan.price}
                      <span className="text-lg text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <a
                      href="https://crm.qially.com/bookings/qimoment"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
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
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let's discuss your specific needs and find the perfect solution
              for your business.
            </p>
            <Button size="lg" asChild>
              <a
                href="https://crm.qially.com/bookings/qimoment"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a Free Consultation
              </a>
            </Button>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
