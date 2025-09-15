import React from "react";
import { MarketingLayout } from "../components/MarketingLayout";

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              About QiEOS
            </h1>
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-600 mb-6">
                QiEOS is a comprehensive platform that unifies client portals,
                admin control, APIs, AI (RAG/voice/vision), billing, and
                per-client public websites.
              </p>
              <p className="text-gray-600 mb-6">
                Built with Cloudflare-first architecture and Supabase backend,
                QiEOS provides a scalable, secure, and feature-rich solution for
                multi-tenant operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
