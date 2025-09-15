import React from 'react';
import { MarketingLayout } from '../components/MarketingLayout';

export default function NotFoundPage() {
  return (
    <MarketingLayout>
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist.
          </p>
          <a
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </MarketingLayout>
  );
}
