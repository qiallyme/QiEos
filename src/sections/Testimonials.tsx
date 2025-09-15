import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { GlassCard } from "../components/ui/glass-card";

const testimonials = [
  {
    quote:
      "Cody is the best, they didn't just get the job done, they found and correct other issues along the ways proactively. Huge savings and potential from the start.",
    author: "Nick Pecoraro",
    role: "Director at MSIL",
    rating: 5,
  },
  {
    quote:
      "The automation solutions implemented have saved us countless hours and significantly improved our operational efficiency. Highly recommended!",
    author: "Sarah Johnson",
    role: "CEO at TechStart",
    rating: 5,
  },
  {
    quote:
      "Professional, thorough, and results-driven. The HR compliance work was exceptional and gave us peace of mind.",
    author: "Michael Chen",
    role: "Founder at GrowthCo",
    rating: 5,
  },
];

export default function Testimonials() {
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
            What My Clients Are Saying
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real feedback from businesses that have transformed their
            operations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-primary/50 mr-2" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>

                <blockquote className="text-muted-foreground mb-6 flex-grow">
                  "{testimonial.quote}"
                </blockquote>

                <div className="border-t pt-4">
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
