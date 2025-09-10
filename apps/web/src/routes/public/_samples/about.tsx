// TODO: Replace with QiEOS UI components when available
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SampleAbout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About QiPortals
          </h1>

          {/* TODO: Replace with QiEOS Card components */}
          <div className="glass-card p-6 rounded-lg mb-8">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Mission</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Building the next generation of cloud-native portal applications
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                QiPortals is designed to be a comprehensive suite of portal
                applications built with modern web technologies and optimized
                for Cloudflare's edge network. Our focus is on performance,
                developer experience, and beautiful user interfaces.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-lg">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Technology Stack</h3>
              </div>
              <div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• React 19 with TypeScript</li>
                  <li>• TanStack Router for routing</li>
                  <li>• Tailwind CSS with glassmorphism</li>
                  <li>• Cloudflare Workers</li>
                  <li>• Model Context Protocol (MCP)</li>
                  <li>• pnpm monorepo architecture</li>
                </ul>
              </div>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Features</h3>
              </div>
              <div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Edge-first architecture</li>
                  <li>• AI-powered knowledge base</li>
                  <li>• Responsive glassmorphism design</li>
                  <li>• Developer-friendly tooling</li>
                  <li>• Plop.js code generation</li>
                  <li>• Type-safe development</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
