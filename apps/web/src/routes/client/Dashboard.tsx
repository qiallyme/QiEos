import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@qieos/ui'

export function ClientDashboard() {
  const { claims } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {claims?.email}
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 relative overflow-hidden">
            <div className="absolute w-56 h-48 bg-blue-500 blur-[200px] -left-1/2 -bottom-1/2 opacity-20"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Tasks</h3>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-400 font-bold text-3xl text-transparent bg-clip-text">12</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 relative overflow-hidden">
            <div className="absolute w-56 h-48 bg-green-500 blur-[200px] -left-1/2 -bottom-1/2 opacity-20"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Projects</h3>
              <span className="bg-gradient-to-r from-green-600 to-emerald-400 font-bold text-3xl text-transparent bg-clip-text">3</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 relative overflow-hidden">
            <div className="absolute w-56 h-48 bg-yellow-500 blur-[200px] -left-1/2 -bottom-1/2 opacity-20"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Files</h3>
              <span className="bg-gradient-to-r from-yellow-600 to-orange-400 font-bold text-3xl text-transparent bg-clip-text">24</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 relative overflow-hidden">
            <div className="absolute w-56 h-48 bg-purple-500 blur-[200px] -left-1/2 -bottom-1/2 opacity-20"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">KB Articles</h3>
              <span className="bg-gradient-to-r from-purple-600 to-pink-400 font-bold text-3xl text-transparent bg-clip-text">8</span>
            </div>
          </div>
        </div>

        {/* Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Task "Review documents" completed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">New file uploaded</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Project milestone reached</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/client/tasks/new" className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Create New Task</div>
                  <div className="text-sm text-gray-500">Add a new task to your project</div>
                </Link>
                <Link to="/client/files" className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Upload File</div>
                  <div className="text-sm text-gray-500">Share documents with your team</div>
                </Link>
                <Link to="/client/kb" className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">View Knowledge Base</div>
                  <div className="text-sm text-gray-500">Browse helpful resources</div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claims?.features?.tasks && (
            <Link
              to="/client/tasks"
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                  <p className="text-gray-500">Manage your tasks and projects</p>
                </div>
              </div>
            </Link>
          )}

          <Link
            to="/client/kb"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Knowledge Base</h3>
                <p className="text-gray-500">Browse documentation and guides</p>
              </div>
            </div>
          </Link>

          {claims?.features?.billing && (
            <Link
              to="/client/billing"
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Billing</h3>
                  <p className="text-gray-500">View invoices and payments</p>
                </div>
              </div>
            </Link>
          )}

          <Link
            to="/client/files"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Files</h3>
                <p className="text-gray-500">Upload and manage files</p>
              </div>
            </div>
          </Link>

          <Link
            to="/client/profile"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                <p className="text-gray-500">Manage your account settings</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
