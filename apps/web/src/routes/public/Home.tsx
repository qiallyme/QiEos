import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="space-y-16 container mx-auto px-4">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">Empower. Innovate. Grow.</h1>
        <p className="text-xl text-muted-foreground mb-8">
          I help entrepreneurs simplify the chaos — tax, HR, tech, automation
          for small business life.
        </p>
        <div className="space-x-4">
          <Link
            to="/about"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md"
          >
            Learn more
          </Link>
          <Link
            to="/contact"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-3 rounded-md"
          >
            Contact
          </Link>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-16 bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl border border-border/50 shadow-sm">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">
            Hi, I’m Cody – your ally in all things business.
          </h2>
          <p className="text-lg text-muted-foreground">
            With over 20 years of experience juggling everything from Fortune
            500 tech to Main Street startups, I provide solo operator, personal
            service to get you real results.
          </p>
        </div>
      </section>

      {/* Service Pillars */}
      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">What I Can Help You With</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service Card 1 */}
            <div className="bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl p-8 shadow-sm border border-border/50">
              <h3 className="text-2xl font-bold mb-3">Taxes & Bookkeeping</h3>
              <p className="mb-4 text-muted-foreground">
                Stress-free tax preparation and meticulous bookkeeping to keep
                your financials in order.
              </p>
              <Link to="/contact" className="text-primary hover:underline">
                Get in touch
              </Link>
            </div>
            {/* Service Card 2 */}
            <div className="bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl p-8 shadow-sm border border-border/50">
              <h3 className="text-2xl font-bold mb-3">HR & Compliance</h3>
              <p className="mb-4 text-muted-foreground">
                Navigating the complexities of HR and ensuring your business
                stays compliant.
              </p>
              <Link to="/contact" className="text-primary hover:underline">
                Get in touch
              </Link>
            </div>
            {/* Service Card 3 */}
            <div className="bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl p-8 shadow-sm border border-border/50">
              <h3 className="text-2xl font-bold mb-3">Automation & Tools</h3>
              <p className="mb-4 text-muted-foreground">
                Implementing smart automation and the right tools to boost your
                productivity.
              </p>
              <Link to="/contact" className="text-primary hover:underline">
                Get in touch
              </Link>
            </div>
            {/* Service Card 4 */}
            <div className="bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl p-8 shadow-sm border border-border/50">
              <h3 className="text-2xl font-bold mb-3">IT & Strategy</h3>
              <p className="mb-4 text-muted-foreground">
                From tech support to long-term IT strategy, I've got your back.
              </p>
              <Link to="/contact" className="text-primary hover:underline">
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why work with me */}
      <section className="py-16 bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl border border-border/50 shadow-sm">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Plain-language, ADHD-friendly, async-ready.
          </h2>
          <p className="text-lg text-muted-foreground">
            I believe in clear, direct communication. No jargon, no run-around.
            I know you're busy, so I'm built for asynchronous work. Send me a
            message, and I'll get back to you with what you need. It's that
            simple.
          </p>
        </div>
      </section>

      {/* What we do / features */}
      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-3">Expert insights</h3>
              <p className="text-muted-foreground">
                Get advice from someone who's seen it all.
              </p>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-3">Networking</h3>
              <p className="text-muted-foreground">
                Connect with a curated network of professionals.
              </p>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-3">Interactive Portal</h3>
              <p className="text-muted-foreground">
                A secure, easy-to-use portal for all our work together.
              </p>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-3">Stay updated</h3>
              <p className="text-muted-foreground">
                Regular updates on the things that matter to your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Strip */}
      <section className="py-16 bg-primary text-primary-foreground rounded-2xl">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to simplify your business?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            No sales pressure, just a conversation.
          </p>
          <div className="flex justify-center items-center space-x-8">
            <a href="tel:+1-555-555-5555" className="text-lg">
              📞 (555) 555-5555
            </a>
            <a href="mailto:cody@qially.me" className="text-lg">
              ✉️ cody@qially.me
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export { Home };
