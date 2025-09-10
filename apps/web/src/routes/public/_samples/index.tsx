// TODO: Replace with QiEOS UI components when available
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SampleIndex() {
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
            {/* TODO: Replace with QiEOS Button component */}
            <button className="glass-button text-white border-white/30 px-4 py-2 rounded">
              Get Started
            </button>
            <button className="glass border-white/20 px-4 py-2 rounded">
              Learn More
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* TODO: Replace with QiEOS Card components */}
          <div className="glass-card p-6 rounded-lg">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Cloudflare-First</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built for Cloudflare Workers with edge computing and global distribution
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Leverage Cloudflare's edge network for lightning-fast performance and global reach.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-lg">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-purple-600 mb-2">MCP Integration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Model Context Protocol for intelligent knowledge base management
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Seamlessly integrate with AI models through standardized MCP endpoints.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-lg">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-indigo-600 mb-2">Glassmorphism UI</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Modern, translucent design with beautiful visual effects
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Experience the future of web design with our glassmorphism interface.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
