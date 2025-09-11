import React, { useState } from "react";

const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, feature: "letter-wizard" }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-4 items-center"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-grow w-full px-4 py-2 bg-background/80 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Joining..." : "Join Waitlist"}
      </button>
      {status === "success" && (
        <p className="text-green-600">You've been added to the waitlist!</p>
      )}
      {status === "error" && (
        <p className="text-red-600">Something went wrong. Please try again.</p>
      )}
    </form>
  );
};

const LetterWizard = () => {
  const isWizardEnabled = import.meta.env.VITE_WIZARD_ENABLED === "true";

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">USCIS Letter Generator</h1>

        <div className="bg-card/60 dark:bg-card/40 backdrop-blur-lg rounded-2xl p-8 shadow-sm border border-border/50">
          {isWizardEnabled ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Letter Wizard is Active
              </h2>
              <p className="mb-4 text-muted-foreground">
                The Letter Wizard component or iframe would be rendered here.
              </p>
              {/* Placeholder for the actual wizard component */}
              <div className="bg-secondary/60 rounded-lg p-8 border border-border/50">
                <p className="font-bold">Wizard Component</p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
              <p className="mb-6 text-muted-foreground">
                The USCIS Letter Wizard is currently in development. Join the
                waitlist to be notified when it's available.
              </p>
              <WaitlistForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { LetterWizard };
