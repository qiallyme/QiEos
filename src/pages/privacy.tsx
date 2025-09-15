import React from "react";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h2>1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when
                you contact us, book a consultation, or use our services. This
                may include your name, email address, phone number, and business
                information.
              </p>

              <h2>2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and
                improve our services, communicate with you, and process
                transactions.
              </p>

              <h2>3. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal
                information to third parties without your consent, except as
                described in this policy or as required by law.
              </p>

              <h2>4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction.
              </p>

              <h2>5. Cookies and Tracking</h2>
              <p>
                We may use cookies and similar tracking technologies to enhance
                your experience on our website and analyze usage patterns.
              </p>

              <h2>6. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal
                information. You may also opt out of certain communications from
                us.
              </p>

              <h2>7. Contact Us</h2>
              <p>
                If you have questions about this privacy policy, please contact
                us at Info@qially.me or +1 (765) 443-4769.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
