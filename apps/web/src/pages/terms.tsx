import React from "react";
import { MarketingLayout } from "../components/MarketingLayout";

export default function TermsPage() {
  return (
    <MarketingLayout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Terms of Service
            </h1>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                These terms of service govern your use of QiEOS. By using our
                service, you agree to be bound by these terms.
              </p>
              <h2 className="text-2xl font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 mb-6">
                By accessing and using QiEOS, you accept and agree to be bound
                by the terms and provision of this agreement.
              </p>
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="text-gray-600 mb-6">
                Permission is granted to temporarily use QiEOS for personal,
                non-commercial transitory viewing only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
