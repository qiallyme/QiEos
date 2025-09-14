import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About QiPortals
          </h1>
          
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle>Mission</CardTitle>
              <CardDescription>
                Building the next generation of cloud-native portal applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                QiPortals is designed to be a comprehensive suite of portal applications 
                built with modern web technologies and optimized for Cloudflare's edge network. 
                Our focus is on performance, developer experience, and beautiful user interfaces.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• React 19 with TypeScript</li>
                  <li>• TanStack Router for routing</li>
                  <li>• Tailwind CSS with glassmorphism</li>
                  <li>• Cloudflare Workers</li>
                  <li>• Model Context Protocol (MCP)</li>
                  <li>• pnpm monorepo architecture</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Edge-first architecture</li>
                  <li>• AI-powered knowledge base</li>
                  <li>• Responsive glassmorphism design</li>
                  <li>• Developer-friendly tooling</li>
                  <li>• Plop.js code generation</li>
                  <li>• Type-safe development</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
