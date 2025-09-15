import React from 'react';
import { MarketingLayout } from '../components/MarketingLayout';

export default function ServicesPage() {
  return (
    <MarketingLayout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Services</h1>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Client Portals</h3>
                <p className="text-gray-600">
                  Secure, branded client portals with task management, file sharing, and knowledge base access.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Admin Control</h3>
                <p className="text-gray-600">
                  Comprehensive admin dashboard for tenant management, CRM, and system administration.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">AI Integration</h3>
                <p className="text-gray-600">
                  Advanced AI capabilities including RAG, voice assistants, and vision tools.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Billing & Payments</h3>
                <p className="text-gray-600">
                  Integrated billing system with Stripe integration and automated invoicing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
