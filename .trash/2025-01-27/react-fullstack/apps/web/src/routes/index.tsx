import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            QiPortals
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Cloudflare-first portal suite with glassmorphism design and MCP knowledge base integration
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="glass-button text-white border-white/30">
              Get Started
            </Button>
            <Button variant="outline" className="glass border-white/20">
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-blue-600">Cloudflare-First</CardTitle>
              <CardDescription>
                Built for Cloudflare Workers with edge computing and global distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Leverage Cloudflare's edge network for lightning-fast performance and global reach.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-purple-600">MCP Integration</CardTitle>
              <CardDescription>
                Model Context Protocol for intelligent knowledge base management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Seamlessly integrate with AI models through standardized MCP endpoints.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-indigo-600">Glassmorphism UI</CardTitle>
              <CardDescription>
                Modern, translucent design with beautiful visual effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Experience the future of web design with our glassmorphism interface.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
