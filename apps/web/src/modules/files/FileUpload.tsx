import React, { useState, useRef } from "react";
import { api } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import styles from "./FileUpload.module.css";

interface FileUploadProps {
  onUploadComplete?: (file: any) => void;
  companyId?: string;
}

export function FileUpload({ onUploadComplete, companyId }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { claims } = useAuth();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError("");

    try {
      // Step 1: Get signed upload URL
      const signResponse = await api.post("/files/sign-upload", {
        filename: file.name,
        content_type: file.type,
        size: file.size,
        company_id: companyId,
      });

      if (!signResponse.success) {
        throw new Error("Failed to get upload URL");
      }

      // Step 2: Upload file to R2
      const uploadResponse = await fetch(signResponse.signed_url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Step 3: Complete upload and save metadata
      const completeResponse = await api.post("/files/complete", {
        key: signResponse.key,
        filename: file.name,
        content_type: file.type,
        size: file.size,
        company_id: companyId,
      });

      if (!completeResponse.success) {
        throw new Error("Failed to save file metadata");
      }

      setProgress(100);
      onUploadComplete?.(completeResponse.file);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />

        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="text-sm text-gray-600">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Click to upload
            </button>{" "}
            or drag and drop
          </div>

          <p className="text-xs text-gray-500">Any file type up to 10MB</p>
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ '--progress': `${progress}%` } as React.CSSProperties}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}
    </div>
  );
}
