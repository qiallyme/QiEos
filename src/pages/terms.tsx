import React from "react";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using QiAlly services, you accept and agree to
                be bound by the terms and provision of this agreement.
              </p>

              <h2>2. Services</h2>
              <p>
                QiAlly provides business consulting, tax preparation, HR
                compliance, automation, and IT strategy services. All services
                are provided on a professional basis with the goal of improving
                your business operations.
              </p>

              <h2>3. Client Responsibilities</h2>
              <p>
                Clients are responsible for providing accurate information,
                timely responses, and necessary documentation to ensure
                successful service delivery.
              </p>

              <h2>4. Confidentiality</h2>
              <p>
                All client information is treated as confidential and will not
                be disclosed to third parties without written consent, except as
                required by law.
              </p>

              <h2>5. Limitation of Liability</h2>
              <p>
                QiAlly's liability is limited to the amount paid for services.
                We are not responsible for indirect or consequential damages.
              </p>

              <h2>6. Contact Information</h2>
              <p>
                For questions about these terms, please contact us at
                Info@qially.me or +1 (765) 443-4769.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
