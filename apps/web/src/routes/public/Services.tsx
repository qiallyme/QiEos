import React from "react";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Taxes & Bookkeeping",
    benefits: [
      "Accurate and timely tax filing.",
      "Comprehensive bookkeeping services.",
      "Financial reporting and analysis.",
      "Payroll processing.",
    ],
    faq: [
      {
        q: "What software do you use?",
        a: "I primarily use QuickBooks Online, but I'm flexible with other platforms.",
      },
      {
        q: "Can you help with back taxes?",
        a: "Yes, I can help you get caught up on your tax filings.",
      },
    ],
  },
  {
    title: "HR & Compliance",
    benefits: [
      "Employee handbook creation.",
      "Compliance audits.",
      "Hiring and onboarding support.",
      "Benefits administration.",
    ],
    faq: [
      {
        q: "Do you offer HR support for small teams?",
        a: "Absolutely. I specialize in helping small businesses manage their HR needs.",
      },
    ],
  },
  {
    title: "Automation & Tools",
    benefits: [
      "Workflow automation.",
      "Software selection and implementation.",
      "Custom tool development.",
      "Training and support.",
    ],
    faq: [
      {
        q: "What kind of businesses do you help?",
        a: "I work with a variety of small businesses, from solo entrepreneurs to teams of up to 50.",
      },
    ],
  },
  {
    title: "IT & Strategy",
    benefits: [
      "Technology consulting.",
      "IT support and troubleshooting.",
      "Cybersecurity best practices.",
      "Long-term technology planning.",
    ],
    faq: [
      {
        q: "Can you be my on-call IT person?",
        a: "Yes, I offer retainer packages for ongoing IT support.",
      },
    ],
  },
];

const Services = () => {
  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold text-center mb-12">Services</h1>
      <div className="space-y-12">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl p-8 shadow-sm border border-border/50"
          >
            <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
            <div className="grid md:grid-cols-2 gap-8 text-muted-foreground">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Benefits
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {service.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-2">
                  {service.faq.map((item, i) => (
                    <div key={i}>
                      <p className="font-semibold text-foreground/90">
                        {item.q}
                      </p>
                      <p>{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-16">
        <Link
          to="/contact"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md text-lg"
        >
          Book a Consult
        </Link>
      </div>
    </div>
  );
};

export { Services };
