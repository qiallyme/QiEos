import React, { useState, useEffect } from "react";
import { api } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

interface File {
  id: string;
  key: string;
  filename: string;
  content_type: string;
  size: number;
  uploaded_at: string;
  company_id?: string;
  download_url: string;
}

export function FileList() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { claims } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/files");
      if (response.success) {
        setFiles(response.files);
      } else {
        setError("Failed to fetch files");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (file: File) => {
    try {
      const response = await api.get(`/files/download/${file.id}`);
      if (response.success) {
        // Create a temporary link to download the file
        const link = document.createElement("a");
        link.href = response.download_url;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      setError(err.message || "Failed to download file");
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await api.delete(`/files/${fileId}`);
      if (response.success) {
        setFiles(files.filter((file) => file.id !== fileId));
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return "🖼️";
    } else if (contentType.startsWith("video/")) {
      return "🎥";
    } else if (contentType.startsWith("audio/")) {
      return "🎵";
    } else if (contentType.includes("pdf")) {
      return "📄";
    } else if (
      contentType.includes("word") ||
      contentType.includes("document")
    ) {
      return "📝";
    } else if (contentType.includes("sheet") || contentType.includes("excel")) {
      return "📊";
    } else if (contentType.includes("zip") || contentType.includes("archive")) {
      return "📦";
    } else {
      return "📁";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
        <button
          onClick={fetchFiles}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Files</h2>
        <button
          onClick={fetchFiles}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Refresh
        </button>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No files found. Upload your first file to get started.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {files.map((file) => (
              <li key={file.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getFileIcon(file.content_type)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.filename}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} •{" "}
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadFile(file)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
