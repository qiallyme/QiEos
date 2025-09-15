import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { GlassCard } from "../components/ui/glass-card";
import { Button } from "../components/ui/button";
import { GradientText } from "../components/ui/gradient-text";
import CalendlyEmbed from "../components/CalendlyEmbed";

interface FormData {
  name: string;
  email: string;
  message: string;
  honeypot: string; // Anti-spam field
}

interface FormStatus {
  type: "idle" | "loading" | "success" | "error";
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
    honeypot: "",
  });

  const [formStatus, setFormStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check honeypot
    if (formData.honeypot) {
      return; // Silent fail for bots
    }

    setFormStatus({ type: "loading", message: "Sending message..." });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setFormStatus({
          type: "success",
          message: "Thank you! Your message has been sent successfully.",
        });
        setFormData({ name: "", email: "", message: "", honeypot: "" });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      setFormStatus({
        type: "error",
        message:
          "Sorry, there was an error sending your message. Please try again or contact us directly.",
      });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "Info@qially.me",
      href: "mailto:Info@qially.me",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (765) 443-4769",
      href: "tel:+17654434769",
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Remote Services Available",
      href: "#",
    },
  ];

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
              Let's <GradientText>Connect</GradientText>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Ready to transform your business operations? Get in touch and
              let's discuss how I can help you achieve your goals.
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Contact Info */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 text-center">
                  <info.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                  <a
                    href={info.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {info.value}
                  </a>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Contact Form & Calendly */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8">
                <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field - hidden from users */}
                  <input
                    type="text"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleInputChange}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                      placeholder="Tell me about your business needs..."
                    />
                  </div>

                  {/* Status Message */}
                  {formStatus.type !== "idle" && (
                    <div
                      className={`flex items-center space-x-2 p-4 rounded-lg ${
                        formStatus.type === "success"
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : formStatus.type === "error"
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {formStatus.type === "success" && (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      {formStatus.type === "error" && (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      <span className="text-sm">{formStatus.message}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={formStatus.type === "loading"}
                  >
                    {formStatus.type === "loading" ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </GlassCard>
            </motion.div>

            {/* Calendly Embed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8">
                <h2 className="text-2xl font-semibold mb-6">Book a Meeting</h2>
                <p className="text-muted-foreground mb-6">
                  Prefer to schedule a call? Book a time that works for you and
                  let's discuss your business needs.
                </p>
                <CalendlyEmbed url="https://calendly.com/qially/qimoment" />
              </GlassCard>
            </motion.div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
