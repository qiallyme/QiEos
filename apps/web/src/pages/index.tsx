import React from 'react';
import { MarketingLayout } from '../components/MarketingLayout';

export default function HomePage() {
  return (
    <MarketingLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to QiEOS
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Unified Client Portal, Admin Control, APIs, AI, Billing & Public Websites
            </p>
            <div className="space-x-4">
              <a
                href="/auth/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started
              </a>
              <a
                href="/about"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
