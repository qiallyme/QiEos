import { motion } from "framer-motion";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";

const clients = [
  { name: "MSIL", logo: "🏢" },
  { name: "TechStart", logo: "🚀" },
  { name: "GrowthCo", logo: "📈" },
  { name: "InnovateLab", logo: "💡" },
  { name: "ScaleUp", logo: "⚡" },
  { name: "FutureBiz", logo: "🌟" },
];

export default function Trust() {
  return (
    <Section className="bg-muted/30">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-medium text-muted-foreground mb-8">
            Trusted by forward-thinking businesses
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {clients.map((client, index) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-background/50 transition-colors"
              >
                <div className="text-2xl">{client.logo}</div>
                <span className="text-sm font-medium text-muted-foreground">
                  {client.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
