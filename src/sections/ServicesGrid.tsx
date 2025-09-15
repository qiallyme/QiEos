import { motion } from "framer-motion";
import { ArrowRight, Calculator, Users, Zap, Settings } from "lucide-react";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { GlassCard } from "../components/ui/glass-card";
import { Button } from "../components/ui/button";

const services = [
  {
    icon: Calculator,
    title: "Taxes & Bookkeeping",
    description:
      "Stress-free tax preparation and meticulous bookkeeping to keep your financials in order.",
    features: [
      "Tax Preparation",
      "Bookkeeping",
      "Financial Planning",
      "Compliance",
    ],
  },
  {
    icon: Users,
    title: "HR & Compliance",
    description:
      "Navigating the complexities of HR and ensuring your business stays compliant.",
    features: ["HR Policies", "Compliance", "Employee Relations", "Training"],
  },
  {
    icon: Zap,
    title: "Automation & Tools",
    description:
      "Implementing smart automation and the right tools to boost your productivity.",
    features: [
      "Process Automation",
      "Tool Integration",
      "Workflow Optimization",
      "Training",
    ],
  },
  {
    icon: Settings,
    title: "IT & Strategy",
    description:
      "From tech support to long-term IT strategy, I've got your back.",
    features: ["IT Strategy", "System Setup", "Security", "Support"],
  },
];

export default function ServicesGrid() {
  return (
    <Section>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            What I Can Help You With
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive business services designed to simplify your operations
            and drive growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-6 h-full flex flex-col">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                </div>

                <p className="text-muted-foreground mb-4 flex-grow">
                  {service.description}
                </p>

                <ul className="space-y-1 mb-6">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-sm text-muted-foreground flex items-center"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button variant="outline" size="sm" className="w-full">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
