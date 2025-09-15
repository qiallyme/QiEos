import React from "react";
import { MarketingLayout } from "../components/MarketingLayout";

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Privacy Policy
            </h1>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                This privacy policy describes how QiEOS collects, uses, and
                protects your information.
              </p>
              <h2 className="text-2xl font-semibold mb-4">
                Information We Collect
              </h2>
              <p className="text-gray-600 mb-6">
                We collect information you provide directly to us, such as when
                you create an account, use our services, or contact us for
                support.
              </p>
              <h2 className="text-2xl font-semibold mb-4">
                How We Use Your Information
              </h2>
              <p className="text-gray-600 mb-6">
                We use the information we collect to provide, maintain, and
                improve our services, process transactions, and communicate with
                you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
