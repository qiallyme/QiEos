import React, { useState } from 'react'
import { PublicKB } from '../../modules/kb/PublicKB'
import { PrivateKB } from '../../modules/kb/PrivateKB'
import { useAuth } from '../../hooks/useAuth'

export function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public')
  const { claims } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 mt-2">Access documentation and guides</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('public')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'public'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Public Documentation
            </button>
            {claims && (
              <button
                onClick={() => setActiveTab('private')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'private'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Private Documentation
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'public' && <PublicKB />}
          {activeTab === 'private' && claims && <PrivateKB />}
        </div>
      </div>
    </div>
  )
}
