import React, { useState } from 'react'
import { FileUpload } from '../../modules/files/FileUpload'
import { FileList } from '../../modules/files/FileList'

export function Files() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadComplete = () => {
    // Trigger a refresh of the file list
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
        <p className="text-gray-600 mt-2">Upload and manage your files</p>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h2>
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <FileList key={refreshKey} />
        </div>
      </div>
    </div>
  )
}
