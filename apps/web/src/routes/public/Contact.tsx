import React, { useState } from "react";

const CalendlyPlaceholder = () => {
  return (
    <div className="bg-secondary/60 rounded-lg p-8 text-center border border-border/50">
      <p className="font-bold text-lg">Calendly Component Placeholder</p>
      <p className="text-muted-foreground">
        This is where the Calendly booking widget will go.
      </p>
    </div>
  );
};

const Contact = () => {
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Contact Me</h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl p-8 shadow-sm border border-border/50">
            <h2 className="text-2xl font-bold mb-4">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-background/80 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-background/80 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-background/80 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-background/80 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
            {status === "success" && (
              <p className="text-green-600 mt-4">Message sent successfully!</p>
            )}
            {status === "error" && (
              <p className="text-red-600 mt-4">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
          <div className="space-y-8">
            <div className="bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">
                Other Ways to Reach Me
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Phone:</strong>{" "}
                  <a
                    href="tel:+1-555-555-5555"
                    className="text-primary hover:underline"
                  >
                    (555) 555-5555
                  </a>
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:cody@qially.me"
                    className="text-primary hover:underline"
                  >
                    cody@qially.me
                  </a>
                </p>
              </div>
            </div>
            <div className="bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">
                Schedule a Consultation
              </h2>
              <CalendlyPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Contact };
