import { motion } from "framer-motion";
import { Search, Target, Zap, CheckCircle } from "lucide-react";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";

const steps = [
  {
    icon: Search,
    title: "Discovery",
    description:
      "We analyze your current processes, identify pain points, and understand your business goals.",
  },
  {
    icon: Target,
    title: "Strategy",
    description:
      "Develop a customized roadmap with clear objectives and measurable outcomes.",
  },
  {
    icon: Zap,
    title: "Implementation",
    description:
      "Execute the plan with precision, integrating tools and processes seamlessly.",
  },
  {
    icon: CheckCircle,
    title: "Optimization",
    description:
      "Monitor results, gather feedback, and continuously improve for maximum impact.",
  },
];

export default function Process() {
  return (
    <Section className="bg-muted/30">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            How We Work Together
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A proven process that delivers results through systematic approach
            and continuous improvement.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="relative">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>

                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-border transform translate-x-8" />
                )}
              </div>

              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
