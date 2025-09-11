import React from "react";

const About = () => {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-4xl mx-auto bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl border border-border/50 shadow-sm p-8 md:p-12">
        <h1 className="text-4xl font-bold text-center mb-8">About Me</h1>
        <div className="space-y-6 text-lg text-muted-foreground">
          <p>
            Hi, I'm Cody. With over 20 years of experience in the business and
            tech world, I've seen it all. From the fast-paced environment of
            Fortune 500 companies to the scrappy, get-it-done world of startups,
            I've learned what it takes to succeed.
          </p>
          <p>
            My approach is simple: I provide personal, one-on-one service.
            You're not just another client to me. I take the time to understand
            your business, your goals, and your challenges. I believe in
            building long-term relationships based on trust and results.
          </p>
          <p>
            As a small firm, I'm able to be nimble and responsive in a way that
            larger companies can't. I'm your single point of contact, your ally
            in navigating the complexities of modern business.
          </p>
        </div>
      </div>
    </div>
  );
};

export { About };
